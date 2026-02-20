import { DashboardHeader } from '@/components/adminDashboard/dashboard-header'
import { KPICards } from '@/components/adminDashboard/kpi-cards'
import { ChartsSection } from '@/components/adminDashboard/charts-section'
import { ActivityLogs } from '@/components/adminDashboard/activity-logs'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

export default function AdminDashboard() {
  const { data, isLoading } = useAdminDashboard()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <DashboardHeader />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <KPICards
            totalRevenue={data?.total_revenue ?? 0}
            activeUsers={data?.active_users ?? 0}
            monitoredSites={data?.monitored_sites ?? 0}
            scrapingErrors={data?.scraping_errors ?? 0}
            isLoading={isLoading}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ChartsSection />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <ActivityLogs errors={data?.recent_errors ?? []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
