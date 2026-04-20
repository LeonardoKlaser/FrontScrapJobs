import { siteCareerService, type SiteConfigFormData } from '@/services/siteCareerService'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useSiteCareer() {
  return useQuery({
    queryKey: ['siteCareerList'],
    queryFn: siteCareerService.getAllSiteCareer,
    staleTime: 60 * 1000 // 1 minute
  })
}

export function useAdminSites() {
  return useQuery({
    queryKey: ['adminSites'],
    queryFn: siteCareerService.getAllSitesAdmin
  })
}

export function useSite(id: number) {
  return useQuery({
    queryKey: ['site', id],
    queryFn: () => siteCareerService.getSiteById(id),
    enabled: !Number.isNaN(id) && id > 0
  })
}

export function useUpdateSiteConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      formData,
      logoFile
    }: {
      id: number
      formData: SiteConfigFormData
      logoFile: File | null
    }) => siteCareerService.updateSiteConfig(id, formData, logoFile),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['adminSites'] })
      qc.invalidateQueries({ queryKey: ['siteCareerList'] })
      qc.invalidateQueries({ queryKey: ['site', vars.id] })
      qc.invalidateQueries({ queryKey: ['public-site-logos'] })
    }
  })
}
