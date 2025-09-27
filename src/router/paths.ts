export const PATHS = {
  landing: '/',
  login: '/login',
  register: '/register',
  app: {
    home: '/app',
    curriculum: '/app/curriculum',
    listSites: '/app/sites',
    adminDashboard: '/app/admin-dashboard',
    addNewSite: '/app/add-new-site'
    // job: (id: string) => `/app/jobs/${id}`
  },
  notFound: '*'
} as const
