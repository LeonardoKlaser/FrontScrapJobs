import { redirect } from 'react-router'
import type { QueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import type { AxiosError } from 'axios'

export function authLoader(queryClient: QueryClient) {
  return async ({ request }: { request: Request }) => {
    const url = new URL(request.url)
    try {
      const user = await queryClient.fetchQuery({
        queryKey: ['user'],
        queryFn: () => authService.getMe(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1
      })
      return user
    } catch (err) {
      const status = (err as AxiosError)?.response?.status
      // Only redirect to login on 401 (actually unauthenticated)
      // For 429 (rate limit) or 5xx (server error), return cached user or null
      if (status === 401) {
        return redirect(`/login?from=${url.pathname}`)
      }
      // Try to return cached user data if available
      const cached = queryClient.getQueryData(['user'])
      if (cached) return cached
      return redirect(`/login?from=${url.pathname}`)
    }
  }
}
