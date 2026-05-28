import { useQuery } from '@tanstack/react-query'
import { getDigestSession } from '@/services/digestService'

// retry: false — token invalido/expirado retorna 404 e nao deve ser refeito.
// staleTime alto: a sessao do digest e estavel durante a visita do usuario.
export function useDigestSession(token: string | undefined) {
  return useQuery({
    queryKey: ['digest-session', token],
    queryFn: () => getDigestSession(token as string),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000
  })
}
