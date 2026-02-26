export function SocialProofSection() {
  const companies = [
    { name: 'Google', logo: 'G' },
    { name: 'Amazon', logo: 'A' },
    { name: 'Microsoft', logo: 'M' },
    { name: 'Netflix', logo: 'N' },
    { name: 'Apple', logo: 'A' },
    { name: 'Meta', logo: 'M' }
  ]

  return (
    <section className="py-20 sm:py-24 border-t border-border/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground mb-10 text-lg tracking-tight">
          Monitorando oportunidades das maiores empresas, como:
        </p>

        <div className="flex items-center justify-center flex-wrap gap-4 md:gap-6">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="flex items-center justify-center w-14 h-14 bg-card border border-border/50 rounded-lg text-muted-foreground font-bold text-lg hover:border-primary/30 hover:text-primary transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {company.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
