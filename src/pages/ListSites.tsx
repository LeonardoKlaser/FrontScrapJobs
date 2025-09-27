"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Mock data for companies with their logos
const companies = [
  { id: 1, name: "Google", logo: "/google-logo.png" },
  { id: 2, name: "Nubank", logo: "/nubank-logo-purple.jpg" },
  { id: 3, name: "iFood", logo: "/ifood-logo-red.jpg" },
  { id: 4, name: "Microsoft", logo: "/microsoft-logo.png" },
  { id: 5, name: "Amazon", logo: "/amazon-logo.png" },
  { id: 6, name: "Netflix", logo: "/netflix-logo-red.jpg" },
  { id: 7, name: "Magazine Luiza", logo: "/magazine-luiza-logo-blue.jpg" },
  { id: 8, name: "Loft", logo: "/loft-logo-green.jpg" },
  { id: 9, name: "QuintoAndar", logo: "/quintoandar-logo-orange.jpg" },
  { id: 10, name: "Boticário", logo: "/botic-rio-logo-green.jpg" },
  { id: 11, name: "Ambev", logo: "/ambev-logo-blue.jpg" },
  { id: 12, name: "Meta", logo: "/meta-logo-blue.jpg" },
  { id: 13, name: "Apple", logo: "/apple-logo.png" },
  { id: 14, name: "Tesla", logo: "/tesla-logo-red.jpg" },
  { id: 15, name: "Spotify", logo: "/spotify-logo-green.jpg" },
  { id: 16, name: "Uber", logo: "/placeholder.svg?height=80&width=80" },
  { id: 17, name: "Airbnb", logo: "/placeholder.svg?height=80&width=80" },
  { id: 18, name: "Mercado Livre", logo: "/placeholder.svg?height=80&width=80" },
  { id: 19, name: "Stone", logo: "/placeholder.svg?height=80&width=80" },
  { id: 20, name: "PagSeguro", logo: "/pagseguro-logo-blue.jpg" },
]

export default function EmpresasPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  return (
    <div className="scrapjobs-theme min-h-screen">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#1e1e1e]">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold text-[#007bff]">ScrapJobs</div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-[#e0e0e0] hover:text-[#007bff] transition-colors">
                Início
              </a>
              <a href="#" className="text-[#e0e0e0] hover:text-[#007bff] transition-colors">
                Preços
              </a>
              <a href="#" className="text-[#007bff] font-semibold">
                Empresas
              </a>
              <a href="#" className="text-[#e0e0e0] hover:text-[#007bff] transition-colors">
                Login
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Companies Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {/* Search Bar */}
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

          {/* Companies Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCompanies.map((company, index) => (
              <Card
                key={company.id}
                className="scrapjobs-card company-card-hover p-6 text-center cursor-pointer fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img
                      src={company.logo || "/placeholder.svg"}
                      alt={`${company.name} logo`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-[#e0e0e0] font-semibold text-sm">{company.name}</h3>
                </div>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#e0e0e0]/60 text-lg">Nenhuma empresa encontrada para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#1e1e1e]">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#e0e0e0] mb-6 text-balance">
            Pronto para automatizar sua busca pela vaga perfeita?
          </h2>
          <Button
            size="lg"
            className="scrapjobs-accent-bg hover:bg-[#0056b3] text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#333333] bg-[#121212] py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[#e0e0e0]/60">© 2025 ScrapJobs. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
