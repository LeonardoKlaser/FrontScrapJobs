import { curriculoService } from '@/services/curriculumService';
import { useQuery } from '@tanstack/react-query';


export function useCurriculum() {
  return useQuery({
    queryKey: ['curriculumList'], 
    queryFn: curriculoService.getCurriculums, 
  });
}