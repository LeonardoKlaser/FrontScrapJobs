import { Mail } from 'lucide-react'
import { LogoMark } from '@/components/common/logo'

export function HeroInboxMockup() {
  return (
    <div
      className="relative w-[400px] -ml-[30px] sm:mx-auto lg:ml-auto lg:mr-[200px] scale-75 md:scale-[0.85] lg:scale-100 origin-top"
      aria-hidden="true"
      role="presentation"
    >
      <div className="relative bg-zinc-50 border border-zinc-200 rounded-2xl shadow-xl overflow-hidden animate-slide-in-from-top">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 bg-white">
          <span className="text-[11px] font-semibold text-zinc-600">📬 Caixa de entrada</span>
          <span className="text-[11px] font-bold text-emerald-500">● há 2 min</span>
        </div>

        <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50/60">
          <div className="flex items-center gap-2 mb-1.5">
            <LogoMark size={28} className="rounded-lg" />
            <span className="text-[13px] font-bold text-zinc-900">ScrapJobs</span>
            <span className="ml-auto text-[11px] text-zinc-400">14:32</span>
          </div>
          <div className="text-[14px] font-bold text-zinc-900 mb-1 leading-snug">
            🔥 Nova vaga na Nubank — publicada há 3 min
          </div>
          <div className="text-[12px] text-zinc-600 leading-relaxed">
            Senior Frontend Developer · São Paulo · Remoto
            <br />
            <span className="text-emerald-600 font-semibold">Aplique antes da concorrência →</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-100 opacity-70">
          <div className="w-6 h-6 rounded-md bg-emerald-200 flex items-center justify-center text-emerald-700 text-[10px] font-bold">
            3
          </div>
          <span className="text-[12px] font-semibold text-zinc-700">ScrapJobs</span>
          <span className="text-[12px] text-zinc-600">
            3 novas vagas: iFood, Itaú, Mercado Livre
          </span>
          <span className="ml-auto text-[11px] text-zinc-400">agora</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-100 opacity-50">
          <Mail className="w-4 h-4 text-zinc-500" />
          <span className="text-[12px] italic text-zinc-500">Digest diário · 12 vagas novas</span>
          <span className="ml-auto text-[11px] text-zinc-400">ontem</span>
        </div>
      </div>

      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[360px] h-[240px] bg-emerald-400/10 rounded-full blur-[150px] pointer-events-none"
        aria-hidden="true"
      />
    </div>
  )
}
