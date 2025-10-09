import { useMutation } from '@tanstack/react-query';
import { SiteCareerService } from '@/services/siteCareerService';

export function useRequestSite() {
  return useMutation({
    mutationFn: (url: string) => SiteCareerService.requestSite(url),
  });
}