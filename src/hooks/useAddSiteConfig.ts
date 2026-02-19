// src/hooks/useAddSiteConfig.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { siteCareerService, type SiteConfigFormData } from '@/services/siteCareerService'

export function useAddSiteConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formData, logoFile }: { formData: SiteConfigFormData; logoFile: File | null }) =>
      siteCareerService.addSiteConfig(formData, logoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] })
    }
  })
}
