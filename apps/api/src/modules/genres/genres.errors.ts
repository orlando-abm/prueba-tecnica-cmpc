export const GENRE_ERRORS = {
  NOT_FOUND: { code: 'GENRE_001', message: 'Género no encontrado' },
  DUPLICATE: { code: 'GENRE_002', message: 'El género ya existe' },
  NOT_ACTIVE: { code: 'GENRE_003', message: 'El género ya está activo' },
  ALREADY_DELETED: { code: 'GENRE_004', message: 'El género ya está eliminado' },
  DUPLICATE_DELETED: {
    code: 'GENRE_005',
    message: 'Ya existe un género eliminado con ese nombre. Restáuralo para volver a usarlo.',
  },
} as const;
