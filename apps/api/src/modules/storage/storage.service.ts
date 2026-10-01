import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import type { Env } from '@/config/env.config.js';

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(
    @InjectPinoLogger(StorageService.name)
    private readonly logger: PinoLogger,
    configService: ConfigService<Env, true>,
  ) {
    const endpoint = configService.get('MINIO_ENDPOINT', { infer: true });
    const port = configService.get('MINIO_PORT', { infer: true });
    const useSsl = configService.get('MINIO_USE_SSL', { infer: true });
    this.bucket = configService.get('MINIO_BUCKET', { infer: true });
    this.publicUrl = configService.get('MINIO_PUBLIC_URL', { infer: true });

    const protocol = useSsl ? 'https' : 'http';
    this.s3 = new S3Client({
      endpoint: `${protocol}://${endpoint}:${port}`,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: configService.get('MINIO_ACCESS_KEY', { infer: true }),
        secretAccessKey: configService.get('MINIO_SECRET_KEY', { infer: true }),
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.ensureBucket();
    } catch (err) {
      this.logger.warn(
        `No se pudo inicializar el bucket "${this.bucket}": ${(err as Error).message}`,
      );
    }
  }

  private async ensureBucket(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return;
    } catch (err) {
      const name = (err as { name?: string; Code?: string }).name;
      const code = (err as { Code?: string }).Code;
      const notFound = name === 'NotFound' || code === 'NotFound' || code === 'NoSuchBucket';
      if (!notFound) throw err;
    }

    await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
    await this.s3.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Sid: 'PublicRead',
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        }),
      }),
    );
    this.logger.info(`Bucket "${this.bucket}" creado con acceso público de lectura`);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const key = `books/${randomUUID()}.${this.resolveExtension(file)}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  private resolveExtension(file: Express.Multer.File): string {
    const fromMime = MIME_EXTENSIONS[file.mimetype];
    if (fromMime) return fromMime;
    const fromName = extname(file.originalname).replace('.', '').toLowerCase();
    return fromName || 'bin';
  }
}
