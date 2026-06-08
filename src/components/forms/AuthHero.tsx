import { Sparkles } from 'lucide-react'
import { Logo } from '@/components/common/logo'

interface HeroJob {
  initial: string
  title: string
  company: string
  match: number
}

interface HeroStat {
  value: string
  label: string
  highlight?: boolean
}

interface AuthHeroProps {
  eyebrow: string
  title: string
  subtitle: string
  jobs: HeroJob[]
  stats: HeroStat[]
}

// Painel apresentacional esquerdo das paginas de auth. Estilo da nova landing:
// fundo zinc-50 (vem do AuthLayout), eyebrow font-mono emerald com ponto, cards
// de vaga retos no visual do JobCard da LP e stats abaixo.
export function AuthHero({ eyebrow, title, subtitle, jobs, stats }: AuthHeroProps) {
  return (
    <div className="relative z-10 flex max-w-md flex-col gap-10">
      <div>
        <Logo size={52} showText className="mb-7" />

        <span
          className="mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold
            uppercase tracking-[0.15em] text-emerald-600"
        >
          <span aria-hidden="true">●</span>
          {eyebrow}
        </span>

        <h1
          className="mb-4 text-balance font-display text-4xl font-semibold leading-[1.1]
            tracking-tight text-zinc-900"
        >
          {title}
        </h1>
        <p className="max-w-md text-base text-zinc-500">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.initial}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3
              shadow-sm"
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg
                bg-emerald-100 text-sm font-bold text-emerald-700"
            >
              {job.initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{job.title}</p>
              <p className="truncate text-xs text-zinc-500">{job.company}</p>
            </div>
            <span
              className="flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1
                text-xs font-semibold text-emerald-700"
            >
              <Sparkles className="h-3 w-3" />
              {job.match}%
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-8 border-t border-zinc-200 pt-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p
              className={`font-display text-2xl font-semibold ${
                stat.highlight ? 'text-emerald-600' : 'text-zinc-900'
              }`}
            >
              {stat.value}
            </p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
