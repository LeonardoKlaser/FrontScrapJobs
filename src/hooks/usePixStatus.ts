import { useQuery } from '@tanstack/react-query'
import { checkPixStatus } from '@/services/paymentService'

export function usePixStatus(pixId: string | null) {
  return useQuery({
    queryKey: ['pix-status', pixId],
    queryFn: () => checkPixStatus(pixId!),
    enabled: !!pixId,
    refetchInterval: (query) => {
      if (query.state.error) return false
      const status = query.state.data
      if (status && status !== 'PENDING') return false
      return 3000
    },
    staleTime: 0
  })
}
