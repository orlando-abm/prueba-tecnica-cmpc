export const AUTH_ERRORS = {
  EMAIL_TAKEN:         { code: 'AUTH_001', message: 'Email already registered' },
  INVALID_CREDENTIALS: { code: 'AUTH_002', message: 'Invalid credentials' },
  UNAUTHORIZED:        { code: 'AUTH_003', message: 'Unauthorized' },
  TOKEN_EXPIRED:       { code: 'AUTH_004', message: 'Token expired' },
} as const;
