export function SocialProofSection() {
    const companies = [
      { name: "Google", logo: "G" },
      { name: "Amazon", logo: "A" },
      { name: "Microsoft", logo: "M" },
      { name: "Netflix", logo: "N" },
      { name: "Apple", logo: "A" },
      { name: "Meta", logo: "M" },
    ]
  
    return (
      <section className="py-16 border-t border-border/50">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Monitorando oportunidades das maiores empresas, como:
          </p>
  
          <div className="flex items-center justify-center space-x-8 md:space-x-12 opacity-60">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className="flex items-center justify-center w-12 h-12 bg-card border border-border rounded-lg text-muted-foreground font-bold text-lg hover:opacity-100 transition-opacity duration-200"
              >
                {company.logo}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  