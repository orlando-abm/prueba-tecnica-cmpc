export const BOOK_ERRORS = {
  NOT_FOUND: { code: 'BOOK_001', message: 'Libro no encontrado' },
  ISBN_TAKEN: { code: 'BOOK_002', message: 'El ISBN ya está en uso' },
  SKU_TAKEN: { code: 'BOOK_003', message: 'El SKU ya está en uso' },
  ALREADY_DELETED: { code: 'BOOK_004', message: 'El libro ya está eliminado' },
  NOT_ACTIVE: { code: 'BOOK_005', message: 'El libro ya está activo' },
  ISBN_TAKEN_DELETED: {
    code: 'BOOK_006',
    message: 'Ya existe un libro eliminado con ese ISBN. Restáuralo para volver a usarlo.',
  },
  SKU_TAKEN_DELETED: {
    code: 'BOOK_007',
    message: 'Ya existe un libro eliminado con ese SKU. Restáuralo para volver a usarlo.',
  },
  GENRE_NOT_FOUND: { code: 'BOOK_008', message: 'El género especificado no existe' },
  AUTHOR_NOT_FOUND: { code: 'BOOK_009', message: 'El autor especificado no existe' },
  PUBLISHER_NOT_FOUND: { code: 'BOOK_010', message: 'La editorial especificada no existe' },
  SLUG_CONFLICT: {
    code: 'BOOK_011',
    message: 'El slug generado a partir del título ya está en uso',
  },
} as const;
