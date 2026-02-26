import { Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-card border-t border-border/50">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">scrapJobs</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors duration-150">
              Termos de Serviço
            </a>
            <a href="#" className="hover:text-foreground transition-colors duration-150">
              Política de Privacidade
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} scrapJobs. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
