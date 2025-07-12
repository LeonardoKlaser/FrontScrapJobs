export const PATHS = {
  landing: '/',
  login: '/login',
  app: {
    home: '/app',
    about: '/app/about'
    // job: (id: string) => `/app/jobs/${id}`
  },
  notFound: '*'
} as const
