import { redirect } from 'react-router'
import type { QueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'

export function guestLoader(queryClient: QueryClient) {
  return async () => {
    try {
      await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: () => authService.getMe(),
        staleTime: 5 * 60 * 1000
      })
      return redirect('/app')
    } catch {
      return null
    }
  }
}
