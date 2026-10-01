import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GENRE_ERRORS } from '../genres.errors.js';
import { COMMON_ERRORS } from '@common/errors/common.errors.js';

const genreExample = { id: '3f2504e0-4f89-11d3-9a0c-0305e82c3301', name: 'Ficción', createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-01-15T10:00:00.000Z', deletedAt: null };
const bodySchema = { example: { name: 'Ficción' } };
const validationError = { success: false, error: { ...COMMON_ERRORS.VALIDATION_ERROR, message: 'name: El nombre es requerido' } };
const notFound = { success: false, error: GENRE_ERRORS.NOT_FOUND };
const duplicate = { success: false, error: GENRE_ERRORS.DUPLICATE };

export const FindAllGenresDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar géneros' }),
    ApiQuery({ name: 'search', required: false, description: 'Filtrar por nombre' }),
    ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'all'], description: 'Estado del género (default: active)' }),
    ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'createdAt'], description: 'Campo de ordenamiento (default: name)' }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Dirección del ordenamiento (default: asc)' }),
    ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, description: 'Resultados por página (default: 20, max: 100)' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Listado de géneros',
      schema: { example: { success: true, data: { items: [genreExample], total: 1, page: 1, limit: 20, totalPages: 1 } } },
    }),
  );

export const FindGenreByIdDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener género por ID' }),
    ApiParam({ name: 'id', description: 'ID del género' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Género encontrado',
      schema: { example: { success: true, data: genreExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: GENRE_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
  );

export const CreateGenreDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Crear género' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Género creado',
      schema: { example: { success: true, data: genreExample } },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: GENRE_ERRORS.DUPLICATE.message,
      schema: { example: duplicate },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const UpdateGenreDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar género' }),
    ApiParam({ name: 'id', description: 'ID del género' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Género actualizado',
      schema: { example: { success: true, data: genreExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: GENRE_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: GENRE_ERRORS.DUPLICATE.message,
      schema: { example: duplicate },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const RestoreGenreDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Restaurar género eliminado' }),
    ApiParam({ name: 'id', description: 'ID del género' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Género restaurado',
      schema: { example: { success: true, data: genreExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: GENRE_ERRORS.NOT_FOUND.message,
      schema: { example: { success: false, error: GENRE_ERRORS.NOT_FOUND } },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: GENRE_ERRORS.NOT_ACTIVE.message,
      schema: { example: { success: false, error: GENRE_ERRORS.NOT_ACTIVE } },
    }),
  );

export const DeleteGenreDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Eliminar género (soft delete)' }),
    ApiParam({ name: 'id', description: 'ID del género' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Género eliminado' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: GENRE_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: GENRE_ERRORS.ALREADY_DELETED.message,
      schema: { example: { success: false, error: GENRE_ERRORS.ALREADY_DELETED } },
    }),
  );
