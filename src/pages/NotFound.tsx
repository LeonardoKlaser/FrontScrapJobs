import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 40%, rgba(16, 185, 129, 0.06) 0%, transparent 70%)'
        }}
      />

      <div className="relative flex flex-col items-center text-center animate-fade-in-up">
        <span className="text-gradient-primary text-[10rem] leading-none font-display font-bold tracking-tighter select-none sm:text-[14rem]">
          404
        </span>

        <div className="mt-2 space-y-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Página não encontrada
          </h1>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            O endereço que você tentou acessar não existe ou foi movido. Verifique a URL ou volte
            para o início.
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <Button asChild variant="glow">
            <Link to="/app">
              <ArrowLeft className="size-4" />
              Voltar ao início
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/">
              <Search className="size-4" />
              Página inicial
            </Link>
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </div>
  )
}
