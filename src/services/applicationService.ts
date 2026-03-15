import axios from 'axios'
import { api } from './api'
import type { ApplicationsResponse, JobApplication } from '@/models/application'

export const applicationService = {
  getAll: async (): Promise<ApplicationsResponse> => {
    try {
      const { data } = await api.get('/api/applications')
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível recuperar candidaturas.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  create: async (jobId: number): Promise<JobApplication> => {
    try {
      const { data } = await api.post('/api/applications', { job_id: jobId })
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro ao registar candidatura.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  update: async (
    id: number,
    body: { status?: string; interview_round?: number | null; notes?: string }
  ): Promise<JobApplication> => {
    try {
      const { data } = await api.patch(`/api/applications/${id}`, body)
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro ao atualizar candidatura.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  remove: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/applications/${id}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Erro ao remover candidatura.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }
}
