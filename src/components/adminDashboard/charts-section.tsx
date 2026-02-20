import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp } from 'lucide-react'

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6 text-balance">
          Receita Mensal (Últimos 6 Meses)
        </h2>
        <div className="h-48 md:h-64 flex flex-col items-center justify-center text-muted-foreground">
          <TrendingUp size={48} className="mb-4 opacity-30" />
          <p className="text-sm">Histórico de receita em breve</p>
        </div>
      </Card>

      <Card className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6 text-balance">
          Novos Utilizadores vs. Cancelamentos (Mês)
        </h2>
        <div className="h-48 md:h-64 flex flex-col items-center justify-center text-muted-foreground">
          <BarChart3 size={48} className="mb-4 opacity-30" />
          <p className="text-sm">Histórico de utilizadores em breve</p>
        </div>
      </Card>
    </div>
  )
}
