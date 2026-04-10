import { api } from './api'
import axios from 'axios'
import type { Curriculum } from '@/models/curriculum'
import type {
  Template,
  ApplySuggestionsPayload,
  ApplySuggestionsResponse
} from '@/models/pdf'

export const pdfService = {
  extractPdf: async (file: File): Promise<Omit<Curriculum, 'id'>> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/curriculum/extract-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || 'Não foi possível extrair dados do PDF.'
        )
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  applySuggestions: async (
    payload: ApplySuggestionsPayload
  ): Promise<ApplySuggestionsResponse> => {
    try {
      const { data } = await api.post('/curriculum/apply-suggestions', payload, {
        timeout: 90000
      })
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || 'Não foi possível aplicar as sugestões.'
        )
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  generatePdf: async (
    curriculumId: number,
    templateId: string
  ): Promise<{ pdf_url: string }> => {
    try {
      const { data } = await api.post(
        `/curriculum/${curriculumId}/generate-pdf`,
        { template_id: templateId },
        { timeout: 90000 }
      )
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || 'Não foi possível gerar o PDF.'
        )
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  getTemplates: async (): Promise<Template[]> => {
    try {
      const { data } = await api.get('/curriculum/templates')
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || 'Não foi possível buscar os templates.'
        )
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }
}
