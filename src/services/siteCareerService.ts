import { api } from './api'
import axios from 'axios'

export interface SiteCareer {
  SiteId: number;
  SiteName: string;
  BaseURL: string;
  LogoURL: string;
}

export type ScrapingType = "CSS" | "API"

export interface FormData {
  base_url: string;
  site_name: string
  is_active: boolean
  scraping_type: ScrapingType
  // CSS Selectors
  job_list_item_selector: string
  title_selector: string
  link_selector: string
  link_attribute: string
  location_selector: string
  next_page_selector: string
  job_description_selector: string
  job_requisition_id_selector: string
  // API Configuration
  api_endpoint_template: string
  api_method: string
  api_headers_json: string
  api_payload_template: string
  json_data_mappings: string
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

  addSiteConfig: async(formData : FormData, logoFile: File | null) => {
    const data = new FormData();

    try{
      data.append("siteData", JSON.stringify(formData));

    if(logoFile){
      data.append('logo', logoFile)
    }

    const response = await api.post('/siteCareer', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    return response.data;
    }catch(error){
      if (axios.isAxiosError(error) && error.response) {
        console.log(error.response.data.error || 'Não foi possível recuperar dados do dashboard.')
        throw new Error(error.response.data.error || 'Não foi possível recuperar dados do dashboard.')
      }
      throw new Error('Não foi possível conectar ao servidor.')
    }
  },
}