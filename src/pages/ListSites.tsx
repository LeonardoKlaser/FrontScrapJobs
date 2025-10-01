"use client"

import { useState, useMemo } from "react"
import { Search, Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label" 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanySubscriptionPopup } from "@/components/companyPopup"
import { useSiteCareer } from "@/hooks/useSiteCareer"


export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [isPopupOpen, setPopupOpen] = useState(false)
  const { data } = useSiteCareer();

  const filteredCompanies = useMemo(() => {
    return data?.filter((company) => company.SiteName.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm, data])

  const handleCompanyClick = (company : any) => {
    setSelectedCompany(company)
    setPopupOpen(true)
  }

  return (
    <div className="scrapjobs-theme min-h-screen">
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#e0e0e0] mb-6 fade-in text-balance">
            Monitore as Empresas dos Seus Sonhos
          </h1>
          <p className="text-xl text-[#e0e0e0] max-w-4xl mx-auto leading-relaxed fade-in text-pretty">
            Nossa plataforma monitora 24/7 as páginas de carreira das maiores empresas do mercado. Deixe o trabalho duro
            conosco e nunca mais perca uma oportunidade.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#e0e0e0] h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por uma empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1e1e1e] border-[#333333] text-[#e0e0e0] placeholder:text-[#e0e0e0]/60 focus:border-[#007bff] focus:ring-[#007bff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCompanies?.map((company, index) => (
              <Card
                key={company.SiteId}
                className="scrapjobs-card company-card-hover p-6 text-center cursor-pointer fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCompanyClick(company)}
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src={company.logo || "/placeholder.svg"}
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div> */}
                  <h3 className="text-[#e0e0e0] font-semibold text-sm">{company.SiteName}</h3>
                </div>
              </Card>
            ))}
          </div>

          {filteredCompanies?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#e0e0e0]/60 text-lg">Nenhuma empresa encontrada para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4">
      <div className="container mx-auto">
        <Card className="max-w-3xl mx-auto bg-card/50 border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
              Expanda seu Radar de Vagas
            </CardTitle>
            <CardDescription className="text-lg pt-2">
              Não encontrou uma empresa? Adicione o portal de carreiras dela e não perca nenhuma oportunidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-end gap-2 mt-4">
              <div className="w-full space-y-2">
                {/* Adicionamos um Label para acessibilidade e clareza */}
                <Label htmlFor="siteUrl" className="text-muted-foreground">
                  Link do portal de carreiras
                </Label>
                <Input
                  id="siteUrl"
                  type="url"
                  placeholder="https://exemplo.com/carreiras"
                  className="py-6 text-base" // Aumenta a altura e o texto do input
                />
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-base" // Ajusta o padding e tamanho
              >
                <span className="mr-2">Enviar</span>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

      <footer className="border-t border-[#333333] bg-[#121212] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#e0e0e0]/60">© 2025 ScrapJobs. Todos os direitos reservados.</p>
        </div>
      </footer>
      <CompanySubscriptionPopup
        company={selectedCompany}
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
      />
    </div>
  )
}
