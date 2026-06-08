import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useUser } from '@/hooks/useUser'
import { PATHS } from '@/router/paths'

// Envolve as paginas de visitante (login/signup/esqueci/redefinir senha) e
// renderiza o conteudo NA HORA. Antes essas rotas usavam o guestLoader, que
// segurava a navegacao num GET /api/me bloqueante — lento no cold start do
// backend (o usuario ficava na LP por segundos ate o login aparecer). Aqui a
// checagem de auth roda em background via useUser() (retry:false, nao-bloqueante);
// se o usuario ja estiver logado, redireciona pro /app. Visitante (401) so ve o
// formulario, sem espera.
//
// Nao ha corrida com o pos-login: useAuth.login/signup faz queryClient.clear() e
// navigate() de forma sincrona, entao o GuestGate desmonta antes de qualquer
// refetch de ['user'] resolver — o destino do `from` continua valendo.
export function GuestGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { data: user } = useUser()

  useEffect(() => {
    if (user) navigate(PATHS.app.home, { replace: true })
  }, [user, navigate])

  return <>{children}</>
}
