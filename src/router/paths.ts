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
    adminSites: '/app/admin-sites',
    // editSitePath e o pattern pra router config; editSite(id) e o helper
    // de navegacao. Manter ambos sincronizados se o pattern mudar.
    editSitePath: '/app/admin-sites/:id/edit',
    editSite: (id: number) => `/app/admin-sites/${id}/edit`,
    account: '/app/account',
    renew: '/app/renew',
    applications: '/app/applications'
  },
  notFound: '*'
} as const
