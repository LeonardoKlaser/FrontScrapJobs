// src/hooks/useAddSiteConfig.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SiteCareerService, type FormData } from '@/services/siteCareerService';

export function useAddSiteConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formData, logoFile }: { formData: FormData, logoFile: File | null }) =>
        SiteCareerService.addSiteConfig(formData, logoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteCareerList'] });
    },
  });
}