import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { JobPreviewList } from './JobPreviewList'
import type { OnboardingCompany } from '@/services/onboardingService'

interface CompanyCardProps {
  company: OnboardingCompany
  checked: boolean
  disabled: boolean
  onToggle: (siteId: number) => void
}

export function CompanyCard({ company, checked, disabled, onToggle }: CompanyCardProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const initial = company.name.charAt(0).toUpperCase()

  return (
    <Card
      className={`gap-3 px-4 py-4 ${disabled ? 'opacity-60' : ''} ${
        checked ? 'border-primary/50 bg-primary/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={() => onToggle(company.site_id)}
          className="mt-1 h-4 w-4 shrink-0 accent-primary disabled:cursor-not-allowed"
          aria-label={`Selecionar ${company.name}`}
        />

        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {company.logo_url && !logoFailed ? (
            <img
              src={company.logo_url}
              alt={`Logo de ${company.name}`}
              className="h-full w-full object-cover"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold leading-snug text-foreground">{company.name}</h3>
            <Badge variant="default" className="text-[11px]">
              {company.matching_jobs_count} vagas
            </Badge>
            {disabled && (
              <Badge variant="outline" className="border-warning/40 text-[11px] text-warning">
                Limite atingido
              </Badge>
            )}
          </div>

          <JobPreviewList jobs={company.preview_jobs} />
        </div>
      </div>
    </Card>
  )
}
