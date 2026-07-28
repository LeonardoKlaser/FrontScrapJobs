import { api } from './api'
import type { CurriculumFile } from '@/models/curriculum'

// Erros de negocio (invalid_format, too_large, limit_reached, not_found,
// invalid_id, storage_unavailable, internal_error) nao sao capturados aqui —
// propagam como AxiosError pra quem chamar ler `error.response.data.error`
// e decidir o toast/i18n (ver Task 14/15).
export const curriculumFilesService = {
  list: async (): Promise<CurriculumFile[]> => {
    const { data } = await api.get<{ files: CurriculumFile[] }>('/api/curriculum-files')
    return data.files
  },

  upload: async (file: File): Promise<CurriculumFile> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ file: CurriculumFile }>('/api/curriculum-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.file
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/api/curriculum-files/${id}`)
  },

  setPrincipal: async (id: number): Promise<void> => {
    await api.patch(`/api/curriculum-files/${id}/principal`)
  },

  // Endpoint 302-redireciona pra uma URL presigned do R2. Front e backend sao
  // same-SITE porem cross-ORIGIN (subdominios distintos em prod, portas
  // distintas em dev) — o cookie HttpOnly de sessao ainda vai junto porque e
  // SameSite=Lax, que permite essa navegacao top-level (<a href> normal).
  // Por isso ancoras de download devem usar target="_blank" pra nao quebrar a
  // navegacao da SPA (responsabilidade de quem consome esta funcao, ver Task 14).
  downloadUrl: (id: number): string => `${api.defaults.baseURL}/api/curriculum-files/${id}/download`
}
