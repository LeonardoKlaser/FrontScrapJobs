// src/hooks/useRegisterUserSite.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SiteCareerService } from "@/services/siteCareerService" // Verifique o caminho para o seu serviço de API
import type { UserSiteRequest } from "@/models/siteCareer" // Crie este arquivo de modelo se ainda não existir

export function useRegisterUserSite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UserSiteRequest) => SiteCareerService.registerUserSite(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteCareer"] })
    },
  })
}