export const ENDPOINTS = {
  auth: {
    login:    '/auth/login',
    register: '/auth/register',
  },
  genres: {
    findAll:  '/genres',
    findById: (id: string) => `/genres/${id}`,
    create:   '/genres',
    update:   (id: string) => `/genres/${id}`,
    remove:   (id: string) => `/genres/${id}`,
    restore:  (id: string) => `/genres/${id}/restore`,
  },
  authors: {
    findAll:  '/authors',
    findById: (id: string) => `/authors/${id}`,
    create:   '/authors',
    update:   (id: string) => `/authors/${id}`,
    remove:   (id: string) => `/authors/${id}`,
    restore:  (id: string) => `/authors/${id}/restore`,
  },
} as const
