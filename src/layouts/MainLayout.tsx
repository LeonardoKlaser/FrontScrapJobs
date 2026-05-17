import { Outlet } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/common/app-sidebar'
import { AppFooter } from '@/components/common/app-footer'
import { ScrollToTop } from '@/components/common/scroll-to-top'
import { TrialBanner } from '@/components/app/trial-banner'
import { FeedbackModal } from '@/components/feedback/FeedbackModal'
import { useFeedbackModal } from '@/hooks/useFeedback'

export function MainLayout() {
  const { t } = useTranslation('common')
  const { shouldShow } = useFeedbackModal()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setFeedbackOpen(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <ScrollToTop />
        <TrialBanner />
        <div className="relative flex-1">
          <SidebarTrigger
            className="md:hidden absolute left-3 top-3 z-40"
            aria-label={t('nav.openMenu')}
          />
          <Outlet />
        </div>
        <AppFooter />
      </SidebarInset>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </SidebarProvider>
  )
}
