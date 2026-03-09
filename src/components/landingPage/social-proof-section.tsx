import { useTranslation } from 'react-i18next'

const companies = [
  {
    name: 'PicPay',
    logo: 'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/5510926d-65b9-446b-b317-d43021a3d5db.png'
  },
  {
    name: 'Nubank',
    logo: 'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/1630b6e3-7956-4677-85e2-f92b34a01364.png'
  },
  {
    name: 'iFood',
    logo: 'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/373e4794-7189-489a-8844-7df3273d2322.jpeg'
  },
  {
    name: 'Natura',
    logo: 'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/192c7f6c-fe02-4e11-a118-8f19a51d5a9f.png'
  },
  {
    name: 'Airbnb',
    logo: 'https://scrapjobs-state-bucket.s3.amazonaws.com/logos/32cfc476-25f7-4061-92af-c91e872e277f.jpeg'
  }
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
            <img
              key={company.name}
              src={company.logo}
              alt={company.name}
              className="h-10 md:h-12 w-auto object-contain rounded-lg opacity-70 hover:opacity-100 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
