import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InjectPinoLogger, type PinoLogger } from 'nestjs-pino';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt.guard.js';
import { STORAGE_ERRORS } from './storage.errors.js';
import { StorageService } from './storage.service.js';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(
    @InjectPinoLogger(StorageController.name)
    private readonly logger: PinoLogger,
    private readonly storageService: StorageService,
  ) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen de libro' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Imagen subida',
    schema: {
      example: {
        success: true,
        data: { url: 'http://localhost:9000/cmpc-libros/books/uuid.jpg' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: STORAGE_ERRORS.FILE_REQUIRED.message,
    schema: { example: { success: false, error: STORAGE_ERRORS.FILE_REQUIRED } },
  })
  async uploadImage(@UploadedFile() file?: Express.Multer.File): Promise<{ url: string }> {
    this.logger.info('POST /storage/image');

    if (!file) {
      throw new BadRequestException(STORAGE_ERRORS.FILE_REQUIRED);
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(STORAGE_ERRORS.INVALID_TYPE);
    }

    try {
      const url = await this.storageService.uploadImage(file);
      return { url };
    } catch (err) {
      this.logger.error(`Fallo al subir imagen: ${(err as Error).message}`);
      throw new InternalServerErrorException(STORAGE_ERRORS.UPLOAD_FAILED);
    }
  }
}
