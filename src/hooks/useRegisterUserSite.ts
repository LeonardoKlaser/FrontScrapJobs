// src/hooks/useRegisterUserSite.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService' // Verifique o caminho para o seu serviço de API
import type { UserSiteRequest } from '@/models/siteCareer' // Crie este arquivo de modelo se ainda não existir

export function useRegisterUserSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UserSiteRequest) => siteCareerService.registerUserSite(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
    }
  })
}

export function useUpdateUserSiteFilters() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ siteId, targetWords }: { siteId: number; targetWords: string[] }) =>
      siteCareerService.updateUserSiteFilters(siteId, targetWords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
    }
  })
}

export function useUnregisterUserSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (siteId: number) => siteCareerService.unregisterUserFromSite(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] })
      queryClient.invalidateQueries({ queryKey: ['latestJobs'] })
    }
  })
}
