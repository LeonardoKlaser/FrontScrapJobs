import { api } from './api'
import axios from 'axios'

export interface SiteCareer {
  SiteId: number;
  SiteName: string;
  BaseURL: string;
}

export const SiteCareerService = {

  getAllSiteCareer: async(): Promise<SiteCareer[]> => {
    try{
      const {data} = await api.get('/api/getSites')
    return data
    }catch (error) {
      if (axios.isAxiosError(error) && error.response) {
       throw new Error(error.response.data.error || 'Não foi possível recuperar dados do dashboard.')
     }
     throw new Error('Não foi possível conectar ao servidor.')
   }
    
  },
}