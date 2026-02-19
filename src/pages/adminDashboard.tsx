import { DashboardHeader } from '@/components/adminDashboard/dashboard-header'
import { KPICards } from '@/components/adminDashboard/kpi-cards'
import { ChartsSection } from '@/components/adminDashboard/charts-section'
import { ActivityLogs } from '@/components/adminDashboard/activity-logs'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <DashboardHeader />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <KPICards />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <ChartsSection />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <ActivityLogs />
        </div>
      </div>
    </div>
  )
}
