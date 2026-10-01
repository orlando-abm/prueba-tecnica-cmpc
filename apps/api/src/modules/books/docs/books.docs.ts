import { HttpStatus, applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BOOK_ERRORS } from '../books.errors.js';
import { COMMON_ERRORS } from '@common/errors/common.errors.js';

const bookExample = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  title: 'Cien años de soledad',
  price: '15.99',
  stock: 10,
  isbn: '978-0060883287',
  sku: null,
  synopsis: null,
  language: 'es',
  pages: 417,
  year: 1967,
  imageUrl: null,
  deletedAt: null,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
  genreId: 'uuid',
  authorId: 'uuid',
  publisherId: 'uuid',
  genre: { id: 'uuid', name: 'Novela' },
  author: { id: 'uuid', name: 'Gabriel García Márquez' },
  publisher: { id: 'uuid', name: 'Editorial Sudamericana' },
};

const bodySchema = {
  example: {
    title: 'Cien años de soledad',
    slug: 'cien-anos-de-soledad',
    authorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    publisherId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    genreId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    price: 15.99,
    stock: 10,
    isbn: '978-0060883287',
    sku: 'BOOK-001',
    synopsis: 'Obra maestra del realismo mágico.',
    language: 'es',
    pages: 417,
    year: 1967,
    imageUrl: 'https://example.com/libro.jpg',
  },
};

const validationError = {
  success: false,
  error: { ...COMMON_ERRORS.VALIDATION_ERROR, message: 'title: El título es requerido' },
};
const notFound = { success: false, error: BOOK_ERRORS.NOT_FOUND };
const isbnTaken = { success: false, error: BOOK_ERRORS.ISBN_TAKEN };
const skuTaken = { success: false, error: BOOK_ERRORS.SKU_TAKEN };

const filterQueries = [
  ApiQuery({ name: 'search', required: false, description: 'Buscar por título' }),
  ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'all'],
    description: 'Estado del libro (default: active)',
  }),
  ApiQuery({ name: 'genreId', required: false, description: 'Filtrar por género (UUID)' }),
  ApiQuery({ name: 'authorId', required: false, description: 'Filtrar por autor (UUID)' }),
  ApiQuery({ name: 'publisherId', required: false, description: 'Filtrar por editorial (UUID)' }),
  ApiQuery({
    name: 'available',
    required: false,
    enum: ['true', 'false'],
    description: 'true: stock > 0 y activo; false: sin stock o eliminado',
  }),
  ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['title', 'price', 'year', 'stock', 'createdAt'],
    description: 'Campo de ordenamiento (default: title)',
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
  ApiQuery({
    name: 'include',
    required: false,
    isArray: true,
    enum: ['genre', 'author', 'publisher'],
    description: 'Relaciones a incluir (default: genre, author, publisher)',
  }),
];

export const FindAllBooksDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Listar libros' }),
    ...filterQueries,
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Listado de libros',
      schema: {
        example: {
          success: true,
          data: { items: [bookExample], total: 1, page: 1, limit: 20, totalPages: 1 },
        },
      },
    }),
  );

export const ExportCsvDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Exportar libros a CSV' }),
    ...filterQueries,
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Archivo CSV con los libros filtrados',
      content: { 'text/csv': {} },
    }),
  );

export const FindBookByIdDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener libro por ID' }),
    ApiParam({ name: 'id', description: 'ID del libro' }),
    ApiQuery({
      name: 'include',
      required: false,
      isArray: true,
      enum: ['genre', 'author', 'publisher'],
      description: 'Relaciones a incluir (default: genre, author, publisher)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Libro encontrado',
      schema: { example: { success: true, data: bookExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: BOOK_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
  );

export const FindBookBySlugDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Obtener libro por slug' }),
    ApiParam({ name: 'slug', description: 'Slug del libro' }),
    ApiQuery({
      name: 'include',
      required: false,
      isArray: true,
      enum: ['genre', 'author', 'publisher'],
      description: 'Relaciones a incluir (default: genre, author, publisher)',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Libro encontrado',
      schema: { example: { success: true, data: bookExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: BOOK_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
  );

export const CreateBookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Crear libro' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Libro creado',
      schema: { example: { success: true, data: bookExample } },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: `${BOOK_ERRORS.ISBN_TAKEN.message} / ${BOOK_ERRORS.SKU_TAKEN.message}`,
      schema: { example: isbnTaken },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Género, autor o editorial no encontrado',
      schema: { example: { success: false, error: BOOK_ERRORS.GENRE_NOT_FOUND } },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const UpdateBookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Actualizar libro' }),
    ApiParam({ name: 'id', description: 'ID del libro' }),
    ApiBody({ schema: bodySchema }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Libro actualizado',
      schema: { example: { success: true, data: bookExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: BOOK_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: `${BOOK_ERRORS.ISBN_TAKEN.message} / ${BOOK_ERRORS.SKU_TAKEN.message}`,
      schema: { example: skuTaken },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Error de validación',
      schema: { example: validationError },
    }),
  );

export const RestoreBookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Restaurar libro eliminado' }),
    ApiParam({ name: 'id', description: 'ID del libro' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Libro restaurado',
      schema: { example: { success: true, data: bookExample } },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: BOOK_ERRORS.NOT_FOUND.message,
      schema: { example: { success: false, error: BOOK_ERRORS.NOT_FOUND } },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: BOOK_ERRORS.NOT_ACTIVE.message,
      schema: { example: { success: false, error: BOOK_ERRORS.NOT_ACTIVE } },
    }),
  );

export const DeleteBookDoc = () =>
  applyDecorators(
    ApiOperation({ summary: 'Eliminar libro (soft delete)' }),
    ApiParam({ name: 'id', description: 'ID del libro' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Libro eliminado' }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: BOOK_ERRORS.NOT_FOUND.message,
      schema: { example: notFound },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: BOOK_ERRORS.ALREADY_DELETED.message,
      schema: { example: { success: false, error: BOOK_ERRORS.ALREADY_DELETED } },
    }),
  );
