import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import ptBRCommon from './locales/pt-BR/common.json'
import ptBRAuth from './locales/pt-BR/auth.json'
import ptBRDashboard from './locales/pt-BR/dashboard.json'
import ptBRCurriculum from './locales/pt-BR/curriculum.json'
import ptBRSites from './locales/pt-BR/sites.json'
import ptBRPlans from './locales/pt-BR/plans.json'
import ptBRAdmin from './locales/pt-BR/admin.json'
import ptBRLanding from './locales/pt-BR/landing.json'
import ptBRAccount from './locales/pt-BR/account.json'
import ptBRApplications from './locales/pt-BR/applications.json'
import ptBRPrivacy from './locales/pt-BR/privacy.json'
import ptBROnboarding from './locales/pt-BR/onboarding.json'
import ptBRAdminEmails from './locales/pt-BR/admin-emails.json'

import enUSCommon from './locales/en-US/common.json'
import enUSAuth from './locales/en-US/auth.json'
import enUSDashboard from './locales/en-US/dashboard.json'
import enUSCurriculum from './locales/en-US/curriculum.json'
import enUSSites from './locales/en-US/sites.json'
import enUSPlans from './locales/en-US/plans.json'
import enUSAdmin from './locales/en-US/admin.json'
import enUSLanding from './locales/en-US/landing.json'
import enUSAccount from './locales/en-US/account.json'
import enUSApplications from './locales/en-US/applications.json'
import enUSPrivacy from './locales/en-US/privacy.json'
import enUSOnboarding from './locales/en-US/onboarding.json'
import enUSAdminEmails from './locales/en-US/admin-emails.json'

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': {
      common: ptBRCommon,
      auth: ptBRAuth,
      dashboard: ptBRDashboard,
      curriculum: ptBRCurriculum,
      sites: ptBRSites,
      plans: ptBRPlans,
      admin: ptBRAdmin,
      landing: ptBRLanding,
      account: ptBRAccount,
      applications: ptBRApplications,
      privacy: ptBRPrivacy,
      onboarding: ptBROnboarding,
      'admin-emails': ptBRAdminEmails
    },
    'en-US': {
      common: enUSCommon,
      auth: enUSAuth,
      dashboard: enUSDashboard,
      curriculum: enUSCurriculum,
      sites: enUSSites,
      plans: enUSPlans,
      admin: enUSAdmin,
      landing: enUSLanding,
      account: enUSAccount,
      applications: enUSApplications,
      privacy: enUSPrivacy,
      onboarding: enUSOnboarding,
      'admin-emails': enUSAdminEmails
    }
  },
  lng: typeof window !== 'undefined' ? localStorage.getItem('i18n-lng') || 'pt-BR' : 'pt-BR',
  fallbackLng: 'pt-BR',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
