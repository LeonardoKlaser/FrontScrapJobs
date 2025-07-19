export const PATHS = {
  landing: '/',
  login: '/login',
  register: '/register',
  app: {
    home: '/app',
    about: '/app/about'
    // job: (id: string) => `/app/jobs/${id}`
  },
  notFound: '*'
} as const
