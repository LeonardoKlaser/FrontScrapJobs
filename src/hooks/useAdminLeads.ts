import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { adminLeadsService } from '@/services/adminLeadsService'

// Extrai mensagem amigável: prioriza body {error: "..."} do backend (admin endpoint
// retorna PT-BR explícito tipo "Lead não encontrado"); fallback pra err.message
// (axios genérico tipo "Request failed with status code 500"); por último string vazia.
function extractErrorMessage(err: unknown): string {
  if (isAxiosError<{ error?: string }>(err)) {
    return err.response?.data?.error ?? err.message
  }
  if (err instanceof Error) return err.message
  return 'Erro desconhecido'
}

export function useAdminLeads() {
  return useQuery({
    queryKey: ['adminLeads'],
    queryFn: adminLeadsService.list,
    staleTime: 30_000,
    // 401 já é tratado pelo interceptor global (api.ts redireciona pra /login).
    // 403 (admin sem permissão / sessão drift) cai no isError do hook —
    // retry só atrasa o feedback. Sem retry pra fail-fast.
    retry: false
  })
}

export function useSetLeadContacted() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, contacted }: { id: number; contacted: boolean }) =>
      adminLeadsService.setContacted(id, contacted),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminLeads'] }),
    onError: (err) => toast.error(extractErrorMessage(err))
  })
}
