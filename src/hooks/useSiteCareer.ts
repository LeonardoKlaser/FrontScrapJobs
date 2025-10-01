import { SiteCareerService } from '@/services/siteCareerService';
import { useQuery } from '@tanstack/react-query';


export function useSiteCareer() {
  return useQuery({
    queryKey: ['siteCareerList'], 
    queryFn: SiteCareerService.getAllSiteCareer, 
  });
}