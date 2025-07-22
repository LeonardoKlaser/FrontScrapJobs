export const PATHS = {
  landing: '/',
  login: '/login',
  register: '/register',
  app: {
    home: '/app',
    curriculum: '/app/curriculum'
    // job: (id: string) => `/app/jobs/${id}`
  },
  notFound: '*'
} as const
