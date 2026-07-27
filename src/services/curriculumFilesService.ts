import { api } from './api'
import type { CurriculumFile } from '@/models/curriculum'

// Erros de negocio (invalid_format, too_large, limit_reached, not_found,
// invalid_id, storage_unavailable, internal_error) nao sao capturados aqui —
// propagam como AxiosError pra quem chamar ler `error.response.data.error`
// e decidir o toast/i18n (ver Task 14/15).
export const curriculumFilesService = {
  list: async (): Promise<CurriculumFile[]> => {
    const { data } = await api.get('/api/curriculum-files')
    return data.files
  },

  upload: async (file: File): Promise<CurriculumFile> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/api/curriculum-files', formData, {
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

  // Endpoint 302-redireciona pra uma URL presigned do R2. Em prod e same-origin
  // (cookie HttpOnly vai junto num <a href> ou <iframe src> normal); em dev
  // VITE_API_URL costuma ser cross-origin — la, ancoras de download devem usar
  // target="_blank" pra nao quebrar a navegacao da SPA (isso e responsabilidade
  // de quem consome esta funcao, ver Task 14).
  downloadUrl: (id: number): string => `${api.defaults.baseURL}/api/curriculum-files/${id}/download`
}
