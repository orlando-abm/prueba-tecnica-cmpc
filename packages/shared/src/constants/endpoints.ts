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
} as const
