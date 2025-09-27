"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#007BFF] text-balance">
        Dashboard de Monitorização
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-[#E0E0E0] text-sm">Período:</span>
        <Select defaultValue="7days">
          <SelectTrigger className="w-40 bg-[#1E1E1E] border-[#333333] text-white hover:bg-[#2A2A2A] transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1E1E1E] border-[#333333]">
            <SelectItem value="24h" className="text-white hover:bg-[#333333] focus:bg-[#333333]">
              Últimas 24h
            </SelectItem>
            <SelectItem value="7days" className="text-white hover:bg-[#333333] focus:bg-[#333333]">
              Últimos 7 dias
            </SelectItem>
            <SelectItem value="month" className="text-white hover:bg-[#333333] focus:bg-[#333333]">
              Este Mês
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
