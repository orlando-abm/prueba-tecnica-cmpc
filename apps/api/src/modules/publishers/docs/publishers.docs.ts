import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PUBLISHER_ERRORS } from '../publishers.errors.js';
import { COMMON_ERRORS } from '@common/errors/common.errors.js';

const publisherExample = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  name: 'Penguin Random House',
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  deletedAt: null,
};
const bodySchema = { example: { name: 'Penguin Random House' } };
const validationError = {
  success: false,
  error: { ...COMMON_ERRORS.VALIDATION_ERROR, message: 'name: El nombre es requerido' },
};
const notFound = { success: false, error: PUBLISHER_ERRORS.NOT_FOUND };
const duplicate = { success: false, error: PUBLISHER_ERRORS.DUPLICATE };

export const FindAllPublishersDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar editoriales' }),
    ApiQuery({ name: 'search', required: false, description: 'Filtrar por nombre' }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['active', 'inactive', 'all'],
      description: 'Estado de la editorial (default: active)',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: ['name', 'createdAt'],
      description: 'Campo de ordenamiento (default: name)',
    }),
    ApiQuery({
      name: 'order',
      required: false,
      enum: ['asc', 'desc'],
      description: 'Dirección del ordenamiento (default: asc)',
    }),
    ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Resultados por página (default: 20, max: 100)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Listado de editoriales',
      schema: {
        example: {
          success: true,
          data: { items: [publisherExample], total: 1, page: 1, limit: 20, totalPages: 1 },
        },
      },
    }),
  );

export const FindPublisherByIdDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener editorial por ID' }),
    ApiParam({ name: 'id', description: 'ID de la editorial' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Editorial encontrada',
      schema: { example: { success: true, data: publisherExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: PUBLISHER_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
  );

export const CreatePublisherDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Crear editorial' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Editorial creada',
      schema: { example: { success: true, data: publisherExample } },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: PUBLISHER_ERRORS.DUPLICATE.message,
      schema: { example: duplicate },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const UpdatePublisherDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar editorial' }),
    ApiParam({ name: 'id', description: 'ID de la editorial' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Editorial actualizada',
      schema: { example: { success: true, data: publisherExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: PUBLISHER_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: PUBLISHER_ERRORS.DUPLICATE.message,
      schema: { example: duplicate },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const RestorePublisherDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Restaurar editorial eliminada' }),
    ApiParam({ name: 'id', description: 'ID de la editorial' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Editorial restaurada',
      schema: { example: { success: true, data: publisherExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: PUBLISHER_ERRORS.NOT_FOUND.message,
      schema: { example: { success: false, error: PUBLISHER_ERRORS.NOT_FOUND } },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: PUBLISHER_ERRORS.NOT_ACTIVE.message,
      schema: { example: { success: false, error: PUBLISHER_ERRORS.NOT_ACTIVE } },
    }),
  );

export const DeletePublisherDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Eliminar editorial (soft delete)' }),
    ApiParam({ name: 'id', description: 'ID de la editorial' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Editorial eliminada' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: PUBLISHER_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: PUBLISHER_ERRORS.ALREADY_DELETED.message,
      schema: { example: { success: false, error: PUBLISHER_ERRORS.ALREADY_DELETED } },
    }),
  );
