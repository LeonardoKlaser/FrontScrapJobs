export const PATHS = {
  landing: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  terms: '/terms',
  privacy: '/privacy',

  checkout: (planId: string) => `/checkout/${planId}`,
  paymentConfirmation: '/payment-confirmation',
  app: {
    home: '/app',
    curriculum: '/app/curriculum',
    listSites: '/app/sites',
    adminDashboard: '/app/admin-dashboard',
    addNewSite: '/app/add-new-site',
    accountPage: '/app/accountPage',
    renew: '/app/renew',
    applications: '/app/applications'
  },
  notFound: '*'
} as const
