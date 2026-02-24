import { api } from './api'
import axios from 'axios'
import type { DashboardData, PaginatedJobsResponse } from '@/models/dashboard'

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const { data } = await api.get('/api/dashboard')
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || 'Não foi possível recuperar dados do dashboard.'
        )
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  getLatestJobs: async (params: {
    days?: number
    search?: string
    page?: number
    limit?: number
  }): Promise<PaginatedJobsResponse> => {
    try {
      const { data } = await api.get('/api/dashboard/jobs', { params })
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          error.response.data.error || 'Não foi possível recuperar as vagas.'
        )
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }
}
