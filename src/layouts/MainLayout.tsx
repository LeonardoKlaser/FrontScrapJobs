import { AppHeader } from '@/components/common/app-header'
import { AppFooter } from '@/components/common/app-footer'
import { Outlet } from 'react-router'
import { ScrollToTop } from '@/components/common/scroll-to-top'
import { TrialBanner } from '@/components/app/trial-banner'
import { FeedbackModal } from '@/components/feedback/FeedbackModal'
import { useFeedbackModal } from '@/hooks/useFeedback'
import { useState, useEffect } from 'react'

export function MainLayout() {
  const { shouldShow } = useFeedbackModal()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setFeedbackOpen(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ScrollToTop />
      <AppHeader />
      <TrialBanner />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <Outlet />
      </main>

      <AppFooter />
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  )
}
