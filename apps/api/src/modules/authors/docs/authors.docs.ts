import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AUTHOR_ERRORS } from '../authors.errors.js';
import { COMMON_ERRORS } from '@common/errors/common.errors.js';

const authorExample = { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', name: 'Gabriel García Márquez', createdAt: '2024-01-15T10:00:00.000Z', updatedAt: '2024-01-15T10:00:00.000Z', deletedAt: null };
const bodySchema = { example: { name: 'Gabriel García Márquez' } };
const validationError = { success: false, error: { ...COMMON_ERRORS.VALIDATION_ERROR, message: 'name: El nombre es requerido' } };
const notFound = { success: false, error: AUTHOR_ERRORS.NOT_FOUND };
const duplicate = { success: false, error: AUTHOR_ERRORS.DUPLICATE };

export const FindAllAuthorsDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar autores' }),
    ApiQuery({ name: 'search', required: false, description: 'Filtrar por nombre' }),
    ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'all'], description: 'Estado del autor (default: active)' }),
    ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'createdAt'], description: 'Campo de ordenamiento (default: name)' }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Dirección del ordenamiento (default: asc)' }),
    ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, description: 'Resultados por página (default: 20, max: 100)' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Listado de autores',
      schema: { example: { success: true, data: { items: [authorExample], total: 1, page: 1, limit: 20, totalPages: 1 } } },
    }),
  );

export const FindAuthorByIdDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener autor por ID' }),
    ApiParam({ name: 'id', description: 'ID del autor' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Autor encontrado',
      schema: { example: { success: true, data: authorExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: AUTHOR_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
  );

export const CreateAuthorDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Crear autor' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Autor creado',
      schema: { example: { success: true, data: authorExample } },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: AUTHOR_ERRORS.DUPLICATE.message,
      schema: { example: duplicate },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const UpdateAuthorDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar autor' }),
    ApiParam({ name: 'id', description: 'ID del autor' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Autor actualizado',
      schema: { example: { success: true, data: authorExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: AUTHOR_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: AUTHOR_ERRORS.DUPLICATE.message,
      schema: { example: duplicate },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const RestoreAuthorDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Restaurar autor eliminado' }),
    ApiParam({ name: 'id', description: 'ID del autor' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Autor restaurado',
      schema: { example: { success: true, data: authorExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: AUTHOR_ERRORS.NOT_FOUND.message,
      schema: { example: { success: false, error: AUTHOR_ERRORS.NOT_FOUND } },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: AUTHOR_ERRORS.NOT_ACTIVE.message,
      schema: { example: { success: false, error: AUTHOR_ERRORS.NOT_ACTIVE } },
    }),
  );

export const DeleteAuthorDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Eliminar autor (soft delete)' }),
    ApiParam({ name: 'id', description: 'ID del autor' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Autor eliminado' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: AUTHOR_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: AUTHOR_ERRORS.ALREADY_DELETED.message,
      schema: { example: { success: false, error: AUTHOR_ERRORS.ALREADY_DELETED } },
    }),
  );
