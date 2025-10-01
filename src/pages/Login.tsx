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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-center">
          <img
            src={Logo}
            alt="Logo Scrap Jobs"
            className="h-48 w-48 select-none"
            draggable={false}
          />
        </div>

        <AuthForm />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Primeira missão por aqui?{' '}
          <Link
            to={PATHS.register}
            className="ml-1 font-medium text-primary hover:underline dark:text-primary"
          >
            Embarque para o Cadastro 🚀
          </Link>
        </p>
      </div>
    </div>
  )
}
