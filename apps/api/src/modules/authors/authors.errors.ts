export const AUTHOR_ERRORS = {
  NOT_FOUND:        { code: 'AUTHOR_001', message: 'Autor no encontrado' },
  DUPLICATE:        { code: 'AUTHOR_002', message: 'El autor ya existe' },
  NOT_ACTIVE:       { code: 'AUTHOR_003', message: 'El autor ya está activo' },
  ALREADY_DELETED:  { code: 'AUTHOR_004', message: 'El autor ya está eliminado' },
  DUPLICATE_DELETED:{ code: 'AUTHOR_005', message: 'Ya existe un autor eliminado con ese nombre. Restáuralo para volver a usarlo.' },
} as const;
