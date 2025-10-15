import { api } from './api';
import axios from 'axios';
import type { Curriculum } from '@/models/curriculum';

export const curriculoService = {
  getCurriculums: async (): Promise<Curriculum[]> => {
    try {
      const { data } = await api.get('/curriculum');
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível buscar os curriculos para este usuario.');
      }
      throw new Error('Não foi possível conectar ao servidor.');
    }
  },
  newCurriculum: async (data : Curriculum) => {
    try {
      await api.post('/curriculum', data);
      return;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Não foi possível buscar os curriculos para este usuario.');
      }
      throw new Error('Não foi possível conectar ao servidor.');
    }
  },
};