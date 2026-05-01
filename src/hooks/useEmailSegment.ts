import { useQuery, useMutation } from '@tanstack/react-query'
import { emailSegmentService } from '@/services/emailSegmentService'
import type { SegmentFilter } from '@/models/email'

export const useSegmentSchema = (scope: 'users' | 'event_payload', eventName?: string) =>
  useQuery({
    queryKey: ['emailSegmentSchema', scope, eventName ?? null],
    queryFn: () => emailSegmentService.getSchema(scope, eventName),
    staleTime: 5 * 60 * 1000
  })

export const useAudiencePreview = () =>
  useMutation({
    mutationFn: (filter: SegmentFilter) => emailSegmentService.previewCount(filter)
  })
