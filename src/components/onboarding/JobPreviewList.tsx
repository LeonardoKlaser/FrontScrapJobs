import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { OnboardingPreviewJob } from '@/services/onboardingService'

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function JobPreviewList({ jobs }: { jobs: OnboardingPreviewJob[] }) {
  const [expanded, setExpanded] = useState(false)

  if (jobs.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline"
      >
        {expanded ? (
          <>
            Ocultar vagas
            <ChevronUp className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            Ver vagas
            <ChevronDown className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      {expanded && (
        <ul className="flex flex-col gap-2">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
            >
              <a
                href={job.job_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
              >
                {job.title}
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
              </a>
              <div className="flex flex-wrap items-center gap-1.5">
                {job.seniority && (
                  <Badge variant="secondary" className="text-[11px]">
                    {capitalize(job.seniority)}
                  </Badge>
                )}
                {job.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
