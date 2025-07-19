import Logo from '@/assets/logo_dark_contornado.png'
import { RegisterForm } from '@/components/forms/Register'
import { PATHS } from '@/router/paths'
import { Link } from 'react-router'

export default function Register() {
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

        <RegisterForm />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem cadastro mas se perdeu pelo caminho?{' '}
          <Link
            to={PATHS.login}
            className="ml-1 font-medium text-primary hover:underline dark:text-primary"
          >
            Teletransporte para o Login ⚡
          </Link>
        </p>
      </div>
    </div>
  )
}
