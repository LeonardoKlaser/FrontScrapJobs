// src/services/planService.ts

import { api } from './api'
import axios from 'axios'
import type { Plan } from '@/models/plan'

export const planService = {
  getAllPlans: async (): Promise<Plan[]> => {
    try {
      const { data } = await api.get('/api/plans')
      return data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível buscar os planos.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },

  // changePlan troca o plano de uma assinatura ativa (ex.: downgrade
  // Ultra -> Profissional). Endpoint especulativo — ainda nao existe backend
  // rodando pra essa rota (ver task-11-report.md); ajustar o path quando o
  // contrato for confirmado.
  changePlan: async (planId: number): Promise<void> => {
    try {
      await api.post('/api/subscription/change-plan', { plan_id: planId })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível trocar de plano.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  }
}
