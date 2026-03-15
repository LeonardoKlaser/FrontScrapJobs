import { useTranslation } from 'react-i18next'
import { usePublicSiteLogos } from '@/hooks/usePublicStats'

export function SocialProofSection() {
  const { t } = useTranslation('landing')
  const { data: logos } = usePublicSiteLogos()

  if (!logos || logos.length === 0) return null

  // Duplicate logos enough times to fill viewport smoothly
  const duplicated =
    logos.length < 3 ? [...logos, ...logos, ...logos, ...logos] : [...logos, ...logos]

  return (
    <section className="py-16 sm:py-20 border-t border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground/60 mb-10 text-sm uppercase tracking-widest">
          {t('socialProof.subtitle')}
        </p>

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
    </section>
  )
}
