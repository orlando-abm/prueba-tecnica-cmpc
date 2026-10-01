export const PUBLISHER_ERRORS = {
  NOT_FOUND: { code: 'PUB_001', message: 'Editorial no encontrada' },
  DUPLICATE: { code: 'PUB_002', message: 'La editorial ya existe' },
  NOT_ACTIVE: { code: 'PUB_003', message: 'La editorial ya está activa' },
  ALREADY_DELETED: { code: 'PUB_004', message: 'La editorial ya está eliminada' },
  DUPLICATE_DELETED: {
    code: 'PUB_005',
    message: 'Ya existe una editorial eliminada con ese nombre. Restáurala para volver a usarla.',
  },
} as const;
