export const PATHS = {
  landing: '/',
  login: '/login',
  register: '/register',
  checkout: (planId: string) => `/checkout/${planId}`,
  app: {
    home: '/app',
    curriculum: '/app/curriculum',
    listSites: '/app/sites',
    adminDashboard: '/app/admin-dashboard',
    addNewSite: '/app/add-new-site',
    accountPage: '/app/accountPage'
    // job: (id: string) => `/app/jobs/${id}`
  },
  notFound: '*'
} as const
