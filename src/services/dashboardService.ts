import { api } from './api'
import axios from 'axios'
import type { DashboardData, JobsResponse } from '@/models/dashboard'

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
    matched_only?: boolean
    regions?: string[]
    company?: string
    location?: string
    sort?: string
    dir?: string
    page?: number
    limit?: number
  }): Promise<JobsResponse> => {
    try {
      // O backend lê `regions` como CSV (BR,REMOTE) num único query param —
      // serializamos aqui em vez de deixar o axios mandar regions[]=...
      const { regions, ...rest } = params
      const query: Record<string, unknown> = { ...rest }
      if (regions && regions.length > 0) query.regions = regions.join(',')
      const { data } = await api.get('/api/dashboard/jobs', { params: query })
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível recuperar as vagas.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  getJobCompanies: async (days?: number): Promise<string[]> => {
    try {
      const { data } = await api.get('/api/dashboard/job-companies', {
        params: days !== undefined ? { days } : {}
      })
      return (data?.companies as string[]) ?? []
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível recuperar as empresas.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }
}
