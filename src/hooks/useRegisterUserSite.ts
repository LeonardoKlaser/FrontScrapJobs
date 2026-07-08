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
    mutationFn: ({
      siteId,
      targetWords,
      locationFilters
    }: {
      siteId: number
      targetWords: string[]
      locationFilters: string[]
    }) => siteCareerService.updateUserSiteFilters(siteId, targetWords, locationFilters),
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

// Ultra-only: op-out/op-in de monitoramento automatico por site.
export function useExcludeSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (siteId: number) => siteCareerService.excludeSite(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
    }
  })
}

export function useUnexcludeSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (siteId: number) => siteCareerService.unexcludeSite(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
    }
  })
}
