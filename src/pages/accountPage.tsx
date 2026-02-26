import { useState } from 'react'
import { User, CreditCard, Lock } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { ProfileSection } from '@/components/accountPage/profile-section'
import { PlanSection } from '@/components/accountPage/plan-section'
import { SecuritySection } from '@/components/accountPage/security-section'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'

type Tab = 'perfil' | 'plano' | 'seguranca'

const menuItems = [
  { id: 'perfil' as Tab, label: 'Perfil', icon: User },
  { id: 'plano' as Tab, label: 'Plano e Faturamento', icon: CreditCard },
  { id: 'seguranca' as Tab, label: 'Segurança', icon: Lock }
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const { data: user } = useUser()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações da Conta"
        description="Gerencie suas informações pessoais e preferências"
        gradient={false}
      />

      <nav
        role="tablist"
        className="animate-fade-in-up flex gap-1 border-b border-border/50 overflow-x-auto scrollbar-thin"
        style={{ animationDelay: '60ms' }}
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
        {activeTab === 'seguranca' && <SecuritySection />}
      </div>
    </div>
  )
}
