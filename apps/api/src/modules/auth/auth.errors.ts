export const AUTH_ERRORS = {
  EMAIL_TAKEN:         { code: 'AUTH_001', message: 'El correo ya está registrado' },
  INVALID_CREDENTIALS: { code: 'AUTH_002', message: 'Correo o contraseña incorrectos' },
  UNAUTHORIZED:        { code: 'AUTH_003', message: 'No autorizado' },
  TOKEN_EXPIRED:       { code: 'AUTH_004', message: 'La sesión ha expirado' },
} as const;
