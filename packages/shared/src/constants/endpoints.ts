export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  genres: {
    findAll: '/genres',
    findById: (id: string) => `/genres/${id}`,
    create: '/genres',
    update: (id: string) => `/genres/${id}`,
    remove: (id: string) => `/genres/${id}`,
    restore: (id: string) => `/genres/${id}/restore`,
  },
  authors: {
    findAll: '/authors',
    findById: (id: string) => `/authors/${id}`,
    create: '/authors',
    update: (id: string) => `/authors/${id}`,
    remove: (id: string) => `/authors/${id}`,
    restore: (id: string) => `/authors/${id}/restore`,
  },
  publishers: {
    findAll: '/publishers',
    findById: (id: string) => `/publishers/${id}`,
    create: '/publishers',
    update: (id: string) => `/publishers/${id}`,
    remove: (id: string) => `/publishers/${id}`,
    restore: (id: string) => `/publishers/${id}/restore`,
  },
} as const;
