import { useState } from 'react'
import { User, CreditCard, LogOut } from 'lucide-react'
import { ProfileSection } from '@/components/accountPage/profile-section'
import { PlanSection } from '@/components/accountPage/plan-section'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'

type Tab = 'perfil' | 'plano' | 'seguranca' | 'notificacoes'

const menuItems = [
  { id: 'perfil' as Tab, label: 'Perfil', icon: User },
  { id: 'plano' as Tab, label: 'Plano e Faturamento', icon: CreditCard }
]

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const { data: user } = useUser()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background dark">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <nav className="space-y-1 sticky top-8">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                )
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors mt-4"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </aside>

          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>

          <main className="flex-1 min-w-0">
            <div className="space-y-6">
              {activeTab === 'perfil' && <ProfileSection user={user} />}
              {activeTab === 'plano' && <PlanSection user={user} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
