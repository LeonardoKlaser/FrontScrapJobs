export const PATHS = {
  landing: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  checkout: (planId: string) => `/checkout/${planId}`,
  app: {
    home: '/app',
    curriculum: '/app/curriculum',
    listSites: '/app/sites',
    adminDashboard: '/app/admin-dashboard',
    addNewSite: '/app/add-new-site',
    accountPage: '/app/accountPage',
    paymentConfirmation: '/app/payment-confirmation'
  },
  notFound: '*'
} as const
