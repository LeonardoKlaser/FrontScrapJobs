import { useTranslation } from 'react-i18next'

const companies = [
  { name: 'Google', weight: 500, tracking: '-0.03em' },
  { name: 'Amazon', weight: 700, tracking: '-0.02em' },
  { name: 'iFood', weight: 700, tracking: '-0.02em' },
  { name: 'Nubank', weight: 600, tracking: '-0.01em' },
  { name: 'Itaú', weight: 700, tracking: '-0.02em' },
  { name: 'Mercado Livre', weight: 600, tracking: '-0.01em' },
]

export function SocialProofSection() {
  const { t } = useTranslation('landing')

  return (
    <section className="py-16 sm:py-20 border-t border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground/60 mb-10 text-sm uppercase tracking-widest">
          {t('socialProof.subtitle')}
        </p>

        <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-6 md:gap-x-14">
          {companies.map((company, index) => (
            <span
              key={company.name}
              className="text-xl md:text-2xl text-muted-foreground/40 hover:text-primary/70 transition-colors duration-300 select-none animate-fade-in-up"
              style={{
                animationDelay: `${index * 80}ms`,
                fontWeight: company.weight,
                letterSpacing: company.tracking,
              }}
            >
              {company.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
