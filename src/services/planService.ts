// src/services/planService.ts

import { api } from './api';
import axios from 'axios';
import type { Plan } from '@/models/plan';

export const planService = {
  getAllPlans: async (): Promise<Plan[]> => {
    try {
      const { data } = await api.get('/api/plans');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível buscar os planos.');
      }
      throw new Error('Não foi possível conectar ao servidor.');
    }
  },
};