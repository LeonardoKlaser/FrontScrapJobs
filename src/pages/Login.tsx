import { AuthForm } from '@/components/forms/Auth'
import { PATHS } from '@/router/paths'
import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import Logo from '@/assets/logo_dark_contornado.png'
import { useUser } from '@/hooks/useUser'

export default function Login() {
  const { data: user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate(PATHS.app.home)
  }, [user, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Subtle radial glow behind card */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="animate-fade-in-up relative w-full max-w-md rounded-lg border border-border/50 bg-card p-8">
        <div className="mb-6 flex items-center justify-center">
          <img
            src={Logo}
            alt="Logo Scrap Jobs"
            className="h-40 w-40 select-none"
            draggable={false}
          />
        </div>

        <AuthForm />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Primeira missao por aqui?{' '}
          <Link to="/#pricing" className="font-medium text-primary hover:underline">
            Escolha um plano
          </Link>
        </p>
      </div>
    </div>
  )
}
