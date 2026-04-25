import { useMutation } from '@tanstack/react-query'
import { saveLead } from '@/services/leadsService'

export function useSaveLead() {
  return useMutation({
    mutationFn: saveLead
  })
}
