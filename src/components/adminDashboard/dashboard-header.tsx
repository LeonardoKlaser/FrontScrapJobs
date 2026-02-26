import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Shield } from 'lucide-react'

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gradient-primary">
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
      <Select defaultValue="7days">
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="24h">Últimas 24h</SelectItem>
          <SelectItem value="7days">Últimos 7 dias</SelectItem>
          <SelectItem value="month">Este Mês</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
