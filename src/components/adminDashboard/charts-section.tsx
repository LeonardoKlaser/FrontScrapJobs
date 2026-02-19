import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 3200 },
  { month: 'Fev', revenue: 3800 },
  { month: 'Mar', revenue: 4100 },
  { month: 'Abr', revenue: 4300 },
  { month: 'Mai', revenue: 4600 },
  { month: 'Jun', revenue: 4820 }
]

const userAcquisitionData = [
  { month: 'Jan', novos: 45, cancelamentos: 12 },
  { month: 'Fev', novos: 52, cancelamentos: 8 },
  { month: 'Mar', novos: 38, cancelamentos: 15 },
  { month: 'Abr', novos: 61, cancelamentos: 9 },
  { month: 'Mai', novos: 49, cancelamentos: 11 },
  { month: 'Jun', novos: 58, cancelamentos: 7 }
]

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
      <Card className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6 text-balance">
          Receita Mensal (Últimos 6 Meses)
        </h2>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickFormatter={(value: number) => `R$ ${value}`}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`R$ ${value}`, 'Receita']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#007BFF"
                strokeWidth={3}
                dot={{ fill: '#007BFF', strokeWidth: 2, r: 3 }}
                activeDot={{
                  r: 5,
                  fill: '#007BFF',
                  stroke: '#007BFF',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="bg-card border-border p-4 md:p-6 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <h2 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6 text-balance">
          Novos Utilizadores vs. Cancelamentos (Mês)
        </h2>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userAcquisitionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="novos" fill="#39ff14" name="Novos Registos" radius={[2, 2, 0, 0]} />
              <Bar
                dataKey="cancelamentos"
                fill="#ff4444"
                name="Cancelamentos"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
