export const PATHS = {
  landing: '/',
  login: '/login',
  register: '/register',
  app: {
    home: '/app',
    curriculum: '/app/curriculum',
    listSites: '/app/sites',
    adminDashboard: '/app/admin-dashboard',
    addNewSite: '/app/add-new-site',
    accountPage: 'app/accountPage',
    checkout: (planId: string) => `app/checkout/${planId}`
    // job: (id: string) => `/app/jobs/${id}`
  },
  notFound: '*'
} as const
