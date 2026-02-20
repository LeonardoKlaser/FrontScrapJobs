import { Card } from '@/components/ui/card'
import type { ScrapingError } from '@/services/adminDashboardService'

interface ActivityLogsProps {
  errors: ScrapingError[]
  isLoading: boolean
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function ActivityLogs({ errors, isLoading }: ActivityLogsProps) {
  return (
    <Card className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
      <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">
        Últimos Erros de Scraping
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 md:px-4 text-muted-foreground font-medium text-sm">
                Data/Hora
              </th>
              <th className="text-left py-3 px-2 md:px-4 text-muted-foreground font-medium text-sm">
                Nome do Site
              </th>
              <th className="text-left py-3 px-2 md:px-4 text-muted-foreground font-medium text-sm">
                Tipo de Erro
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground text-sm">
                  Carregando...
                </td>
              </tr>
            ) : errors.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-muted-foreground text-sm">
                  Nenhum erro de scraping registrado
                </td>
              </tr>
            ) : (
              errors.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border hover:bg-muted transition-colors duration-200"
                >
                  <td className="py-3 px-2 md:px-4 text-foreground text-sm font-mono">
                    {formatDate(log.created_at)} {formatTime(log.created_at)}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-foreground text-sm font-medium">
                    {log.site_name}
                  </td>
                  <td className="py-3 px-2 md:px-4 text-destructive text-sm truncate max-w-xs">
                    {log.error_message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
