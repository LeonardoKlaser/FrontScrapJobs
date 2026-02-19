import { redirect } from 'react-router'
import type { QueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'

export function authLoader(queryClient: QueryClient) {
  return async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    try {
      const user = await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: () => authService.getMe(),
        staleTime: 5 * 60 * 1000 // 5 minutes
      })
      return user
    } catch {
      return redirect(`/login?from=${url.pathname}`)
    }
  }
}
