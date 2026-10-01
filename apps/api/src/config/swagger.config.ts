import { Logger, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const logger = new Logger('SwaggerConfig');

const bearerAuth = {
  type: 'http' as const,
  scheme: 'bearer',
  bearerFormat: 'JWT',
};

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('CMPC Libros API')
    .setDescription('API de gestión de inventario de libros')
    .setVersion('1.0')
    .addBearerAuth(bearerAuth, 'bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  logger.log('Swagger Docs running on: /docs');
}
