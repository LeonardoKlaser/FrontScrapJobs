import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-gradient-primary">
            Painel Administrativo
          </h1>
          <Badge variant="default" className="hidden sm:inline-flex">
            <Shield className="size-3" />
            Admin
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Visão geral da plataforma e métricas de operação
        </p>
      </div>
    </div>
  )
}
