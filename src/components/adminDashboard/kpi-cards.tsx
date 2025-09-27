import type React from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Users, Globe, AlertTriangle } from "lucide-react"

interface KPICardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  trend?: "positive" | "negative" | "neutral"
  delay?: string
}

function KPICard({ title, value, subtitle, icon, trend = "neutral", delay = "0s" }: KPICardProps) {
  const trendColor =
    trend === "positive" ? "text-[#39ff14]" : trend === "negative" ? "text-[#ff4444]" : "text-[#E0E0E0]"

  return (
    <Card
      className="bg-[#1E1E1E] border-[#333333] p-4 md:p-6 hover:shadow-lg hover:shadow-[#007BFF]/20 hover:border-[#007BFF]/30 transition-all duration-300 group cursor-pointer transform hover:scale-105"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-[#E0E0E0] text-xs md:text-sm font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-[#007BFF] group-hover:text-[#0056b3] transition-colors">
            {value}
          </p>
          <p className={`text-xs md:text-sm ${trendColor} leading-tight`}>{subtitle}</p>
        </div>
        <div className="text-[#007BFF] opacity-60 group-hover:opacity-100 transition-opacity ml-2">{icon}</div>
      </div>
    </Card>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <KPICard
        title="Faturamento (Mês)"
        value="R$ 4.820,50"
        subtitle="+12.5% vs. mês anterior"
        icon={<TrendingUp size={20} className="md:w-6 md:h-6" />}
        trend="positive"
        delay="0.1s"
      />
      <KPICard
        title="Utilizadores Ativos"
        value="142"
        subtitle="+21 novos este mês"
        icon={<Users size={20} className="md:w-6 md:h-6" />}
        trend="positive"
        delay="0.2s"
      />
      <KPICard
        title="Sites Monitorizados"
        value="35"
        subtitle="32 Ativos / 3 Inativos"
        icon={<Globe size={20} className="md:w-6 md:h-6" />}
        trend="neutral"
        delay="0.3s"
      />
      <KPICard
        title="Erros de Scraping (24h)"
        value="3"
        subtitle="Principal ofensor: TechCorp"
        icon={<AlertTriangle size={20} className="md:w-6 md:h-6" />}
        trend="negative"
        delay="0.4s"
      />
    </div>
  )
}
