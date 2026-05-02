export const PATHS = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  terms: '/terms',
  privacy: '/privacy',

  checkout: (planId: string) => `/checkout/${planId}`,
  paymentConfirmation: '/payment-confirmation',
  feedback: '/feedback',
  app: {
    home: '/app',
    curriculum: '/app/curriculum',
    listSites: '/app/sites',
    adminDashboard: '/app/admin-dashboard',
    addNewSite: '/app/add-new-site',
    adminSites: '/app/admin-sites',
    adminLeads: '/app/admin-leads',
    // editSitePath e o pattern pra router config; editSite(id) e o helper
    // de navegacao. Manter ambos sincronizados se o pattern mudar.
    editSitePath: '/app/admin-sites/:id/edit',
    editSite: (id: number) => `/app/admin-sites/${id}/edit`,
    account: '/app/account',
    renew: '/app/renew',
    applications: '/app/applications',
    adminEmails: {
      hub: '/app/admin-emails',
      templates: '/app/admin-emails/templates',
      templateNew: '/app/admin-emails/templates/new',
      templateEdit: (id: number | string) => `/app/admin-emails/templates/${id}`,
      events: '/app/admin-emails/events',
      lifecycle: '/app/admin-emails/lifecycle',
      lifecycleNew: '/app/admin-emails/lifecycle/new',
      lifecycleEdit: (id: number | string) => `/app/admin-emails/lifecycle/${id}`,
      campaigns: '/app/admin-emails/campaigns',
      campaignNew: '/app/admin-emails/campaigns/new',
      campaignEdit: (id: number | string) => `/app/admin-emails/campaigns/${id}`,
      logs: '/app/admin-emails/logs'
    }
  },
  notFound: '*'
} as const
