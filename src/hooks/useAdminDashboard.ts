import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminDashboardService,
  emailConfigService,
  type UpdateEmailConfigPayload
} from '@/services/adminDashboardService'

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminDashboardService.getDashboard
  })
}

export function useEmailConfig() {
  return useQuery({
    queryKey: ['email-config'],
    queryFn: emailConfigService.getConfig
  })
}

export function useUpdateEmailConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateEmailConfigPayload) => emailConfigService.updateConfig(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-config'] })
    }
  })
}
