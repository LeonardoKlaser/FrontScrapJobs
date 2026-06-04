import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, CreditCard, Lock, MessageCircle } from 'lucide-react'
import { AppPageHeader } from '@/components/common/app-page-header'
import { ProfileSection } from '@/components/accountPage/profile-section'
import { PlanSection } from '@/components/accountPage/plan-section'
import { SecuritySection } from '@/components/accountPage/security-section'
import { WhatsAppSection } from '@/components/accountPage/whatsapp-section'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

type Tab = 'perfil' | 'plano' | 'seguranca' | 'notificacoes'

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const { data: user } = useUser()
  const { t } = useTranslation('account')

  // Beta fechado: a aba de notificações (WhatsApp) só aparece pra quem está na
  // allowlist (whatsapp_enabled). No GA, remover o filtro.
  const menuItems = [
    { id: 'perfil' as Tab, label: t('tabs.profile'), icon: User },
    { id: 'plano' as Tab, label: t('tabs.planBilling'), icon: CreditCard },
    ...(user?.whatsapp_enabled
      ? [{ id: 'notificacoes' as Tab, label: t('tabs.notifications'), icon: MessageCircle }]
      : []),
    { id: 'seguranca' as Tab, label: t('tabs.security'), icon: Lock }
  ]

  return (
    <>
      <AppPageHeader title={t('pageTitle.account', { ns: 'common' })} />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <p className="text-sm text-muted-foreground">{t('description')}</p>

        <nav
          role="tablist"
          className="animate-fade-in-up flex gap-1 border-b border-border/50 overflow-x-auto scrollbar-thin [animation-delay:60ms]"
        >
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeTab === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="animate-tab-content-in" role="tabpanel" key={activeTab}>
          {activeTab === 'perfil' && <ProfileSection user={user} />}
          {activeTab === 'plano' && <PlanSection user={user} />}
          {activeTab === 'notificacoes' && <WhatsAppSection user={user} />}
          {activeTab === 'seguranca' && <SecuritySection />}
        </div>
      </div>
    </>
  )
}
