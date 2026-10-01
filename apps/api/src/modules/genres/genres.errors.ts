export const GENRE_ERRORS = {
  NOT_FOUND:         { code: 'GENRE_001', message: 'Género no encontrado' },
  DUPLICATE:         { code: 'GENRE_002', message: 'El género ya existe' },
  NOT_DELETED:       { code: 'GENRE_003', message: 'El género no está eliminado' },
} as const;
