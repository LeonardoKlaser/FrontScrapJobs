import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/authService'

export function useUser() {
  return useQuery({
    queryKey: ['user'], 
    queryFn: authService.getMe, 
    retry: false, 
    refetchOnWindowFocus: true, 
  })
}