import { DashboardHeader } from '@/components/adminDashboard/dashboard-header'
import { KPICards } from '@/components/adminDashboard/kpi-cards'
import { ChartsSection } from '@/components/adminDashboard/charts-section'
import { ActivityLogs } from '@/components/adminDashboard/activity-logs'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard()

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up" style={{ animationDelay: '50ms' }}>
        <DashboardHeader />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <KPICards
          totalRevenue={data?.total_revenue ?? 0}
          activeUsers={data?.active_users ?? 0}
          monitoredSites={data?.monitored_sites ?? 0}
          scrapingErrors={data?.scraping_errors ?? 0}
          isLoading={isLoading}
        />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <ChartsSection />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <ActivityLogs errors={data?.recent_errors ?? []} isLoading={isLoading} />
      </div>
    </div>
  )
}
