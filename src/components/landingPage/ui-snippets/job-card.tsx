import type { RecentJob } from '@/services/publicJobsService'
import { useTranslation } from 'react-i18next'

interface JobCardProps {
  job: RecentJob
  blurred?: boolean
}

export function JobCard({ job, blurred = false }: JobCardProps) {
  const { t } = useTranslation('landing')
  const ago =
    job.posted_hours_ago >= 24
      ? t('hero.ago.days', { count: Math.floor(job.posted_hours_ago / 24) })
      : t('hero.ago.hours', { count: job.posted_hours_ago })

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 ${
        blurred ? 'blur-[3px] select-none' : ''
      }`}
      aria-hidden={blurred ? 'true' : undefined}
      tabIndex={blurred ? -1 : undefined}
    >
      <div className="flex items-center gap-3 min-w-0">
        {job.logo_url ? (
          <img
            src={job.logo_url}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
            {job.company.charAt(0)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">{job.title}</p>
          <p className="truncate text-xs text-zinc-500">{job.company}</p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-medium text-emerald-600">{ago}</span>
    </div>
  )
}
