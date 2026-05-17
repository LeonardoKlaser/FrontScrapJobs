import { useTranslation } from 'react-i18next'
import { DashboardHeader } from '@/components/adminDashboard/dashboard-header'
import { KPICards } from '@/components/adminDashboard/kpi-cards'
import { EmailConfigSection } from '@/components/adminDashboard/email-config-section'
import { ActivityLogs } from '@/components/adminDashboard/activity-logs'
import { AppPageHeader } from '@/components/common/app-page-header'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

export default function AdminDashboard() {
  const { t } = useTranslation('common')
  const { data, isLoading } = useAdminDashboard()

  return (
    <>
      <AppPageHeader title={t('pageTitle.adminDashboard')} />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <div className="animate-fade-in-up">
          <DashboardHeader />
        </div>
        <div className="animate-fade-in-up [animation-delay:60ms]">
          <KPICards
            totalRevenue={data?.total_revenue ?? 0}
            activeUsers={data?.active_users ?? 0}
            monitoredSites={data?.monitored_sites ?? 0}
            scrapingErrors={data?.scraping_errors ?? 0}
            isLoading={isLoading}
          />
        </div>
        <div className="animate-fade-in-up [animation-delay:120ms]">
          <EmailConfigSection />
        </div>
        <div className="animate-fade-in-up [animation-delay:180ms]">
          <ActivityLogs errors={data?.recent_errors ?? []} isLoading={isLoading} />
        </div>
      </div>
    </>
  )
}
