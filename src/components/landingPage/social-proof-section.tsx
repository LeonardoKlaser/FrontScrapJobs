import { useTranslation } from 'react-i18next'
import { usePublicSiteLogos } from '@/hooks/usePublicStats'
import { SectionWrapper } from './section-wrapper'

export function SocialProofSection() {
  const { t } = useTranslation('landing')
  const { data: logos } = usePublicSiteLogos()

  if (!logos || logos.length === 0) return null

  const duplicated =
    logos.length < 3 ? [...logos, ...logos, ...logos, ...logos] : [...logos, ...logos]

  return (
    <SectionWrapper>
      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          {/* New title + subtitle */}
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-zinc-900">
              {t('socialProofNew.title')}
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              {t('socialProofNew.subtitle')}
            </p>
          </div>

          {/* Existing carousel */}
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div
              className="flex w-max animate-logo-scroll hover:[animation-play-state:paused] will-change-transform"
              style={{ animationDuration: `${Math.max(logos.length * 3, 15)}s` }}
            >
              {duplicated.map((logo, index) => (
                <img
                  key={`${logo.site_name}-${index}`}
                  src={logo.logo_url}
                  alt={logo.site_name}
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain rounded-lg opacity-70 hover:opacity-100 transition-all duration-300 mx-4 sm:mx-6 md:mx-8 shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
