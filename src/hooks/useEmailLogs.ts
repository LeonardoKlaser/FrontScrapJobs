import { useMutation, useQuery } from '@tanstack/react-query'
import { emailLogsService } from '@/services/emailLogsService'
import type { EmailLogFilters } from '@/models/email'

export const emailLogsKey = ['emailLogs'] as const
export const emailLogKey = (id: number) => ['emailLog', id] as const

export const useEmailLogs = (filters: EmailLogFilters = {}) =>
  useQuery({
    queryKey: [...emailLogsKey, filters],
    queryFn: () => emailLogsService.list(filters)
  })

export const useEmailLog = (id: number | null) =>
  useQuery({
    queryKey: id ? emailLogKey(id) : ['emailLog', null],
    queryFn: () => emailLogsService.get(id as number),
    enabled: id !== null && id > 0
  })

export const useExportEmailLogsCSV = () =>
  useMutation({
    mutationFn: (filters: EmailLogFilters = {}) => emailLogsService.exportCSV(filters)
  })
