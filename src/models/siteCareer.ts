export interface SiteCareer {
  site_id: number
  site_name: string
  base_url: string
  logo_url: string | null
  is_subscribed: boolean
  target_words?: string[]
  created_at: string
}

export interface UserSiteRequest {
  site_id: number
  target_words: string[]
}

// SiteConfig e o shape completo retornado por GET /siteCareer e
// GET /siteCareer/:id (endpoints admin). Difere de SiteCareer (DTO
// publico usado pela listagem de empresas autenticada).
export interface SiteConfig {
  id: number
  site_name: string
  base_url: string
  logo_url: string | null
  is_active: boolean
  scraping_type: 'CSS' | 'API' | 'HEADLESS'
  job_list_item_selector: string | null
  title_selector: string | null
  link_selector: string | null
  link_attribute: string | null
  location_selector: string | null
  next_page_selector: string | null
  job_description_selector: string | null
  job_requisition_id_selector: string | null
  job_requisition_id_attribute: string | null
  api_endpoint_template: string | null
  api_method: string | null
  api_headers_json: string | null
  api_payload_template: string | null
  json_data_mappings: string | null
  headless_actions_json: string | null
  created_at: string
}
