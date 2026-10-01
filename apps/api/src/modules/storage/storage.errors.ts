export const STORAGE_ERRORS = {
  FILE_REQUIRED: { code: 'STORAGE_001', message: 'El archivo es requerido' },
  INVALID_TYPE: { code: 'STORAGE_002', message: 'Solo se permiten imágenes' },
  UPLOAD_FAILED: { code: 'STORAGE_003', message: 'No se pudo subir la imagen' },
} as const;
