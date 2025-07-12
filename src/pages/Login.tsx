import { Auth } from '@/components/forms/Auth'
import { useAuth } from '@/hooks/useAuth'
import { PATHS } from '@/router/paths'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'

export default function Login() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) navigate(PATHS.app.home)
  }, [token, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold">Entrar no Scrap Jobs</h1>
        <Auth />
      </div>
    </div>
  )
}
