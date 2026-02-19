import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#007BFF] text-balance">
        Dashboard de Monitorização
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-foreground text-sm">Período:</span>
        <Select defaultValue="7days">
          <SelectTrigger className="w-40 bg-card border-border text-foreground hover:bg-muted transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="24h" className="text-foreground hover:bg-muted focus:bg-muted">
              Últimas 24h
            </SelectItem>
            <SelectItem value="7days" className="text-foreground hover:bg-muted focus:bg-muted">
              Últimos 7 dias
            </SelectItem>
            <SelectItem value="month" className="text-foreground hover:bg-muted focus:bg-muted">
              Este Mês
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
