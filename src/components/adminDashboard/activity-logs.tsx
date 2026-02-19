import { Card } from '@/components/ui/card'

const errorLogs = [
  {
    time: '14:32',
    site: 'TechCorp',
    error: 'Timeout na conexão'
  },
  {
    time: '13:45',
    site: 'DataFlow',
    error: 'Elemento não encontrado'
  },
  {
    time: '12:18',
    site: 'TechCorp',
    error: 'Rate limit excedido'
  },
  {
    time: '11:55',
    site: 'WebScrape Inc',
    error: 'Captcha detectado'
  },
  {
    time: '10:22',
    site: 'InfoSite',
    error: 'Estrutura HTML alterada'
  }
]

export function ActivityLogs() {
  return (
    <Card className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-[#007BFF]/10 transition-all duration-300">
      <h2 className="text-lg md:text-xl font-semibold text-[#007BFF] mb-4 md:mb-6">
        Últimos Erros de Scraping
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 md:px-4 text-muted-foreground font-medium text-sm">
                Horário
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
            {errorLogs.map((log, index) => (
              <tr
                key={index}
                className="border-b border-border hover:bg-muted transition-colors duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="py-3 px-2 md:px-4 text-foreground text-sm font-mono">{log.time}</td>
                <td className="py-3 px-2 md:px-4 text-foreground text-sm font-medium">
                  {log.site}
                </td>
                <td className="py-3 px-2 md:px-4 text-[#ff4444] text-sm">{log.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
