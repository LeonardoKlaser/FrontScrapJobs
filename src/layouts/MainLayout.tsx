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

// Hidrata o estado inicial da sidebar lendo o cookie escrito pelo
// SidebarProvider (sidebar_state=true|false). Sem isso, o provider escreve
// o cookie em todo toggle mas nunca o lê de volta, então o reload sempre
// reabre. Tolerante a cookies bloqueados (Safari private, sem `document`).
function readSidebarCookie(): boolean {
  try {
    if (typeof document === 'undefined') return true
    const match = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/)
    return match ? match[1] === 'true' : true
  } catch {
    return true
  }
}

export function MainLayout() {
  const { t } = useTranslation('common')
  const { shouldShow } = useFeedbackModal()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [initialOpen] = useState(readSidebarCookie)

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setFeedbackOpen(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  return (
    <SidebarProvider defaultOpen={initialOpen}>
      <AppSidebar />
      <SidebarInset>
        <ScrollToTop />
        <TrialBanner />
        <SidebarTrigger
          className="md:hidden fixed left-3 top-3 z-40"
          aria-label={t('nav.openMenu')}
        />
        <div className="flex-1">
          <Outlet />
        </div>
        <AppFooter />
      </SidebarInset>
      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </SidebarProvider>
  )
}
