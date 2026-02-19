import { useMutation } from '@tanstack/react-query'
import { siteCareerService } from '@/services/siteCareerService'

export function useRequestSite() {
  return useMutation({
    mutationFn: (url: string) => siteCareerService.requestSite(url)
  })
}
