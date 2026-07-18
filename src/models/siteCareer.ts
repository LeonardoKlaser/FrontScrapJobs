export interface SiteLocation {
  site_id: number
  region: string
  job_count: number
}

export interface SiteCareer {
  site_id: number
  site_name: string
  base_url: string
  logo_url: string | null
  is_subscribed: boolean
  target_words?: string[]
  location_filters?: string[]
  locations?: SiteLocation[]
  seniority_levels?: string[]
  created_at: string
  // is_excluded so existe no payload pra usuarios Ultra (todos os sites sao
  // monitorados automaticamente; exclusao e op-out). A PRESENCA da chave (nao
  // o valor) e o sinal de modo Ultra — is_subscribed vaza como false pro Ultra
  // e nao deve ser usado pra essa deteccao. Ver contrato da Task 9.
  is_excluded?: boolean
}

export interface UserSiteRequest {
  site_id: number
  target_words: string[]
  location_filters?: string[]
}

// SiteConfig e o shape completo retornado por GET /siteCareer e
// GET /siteCareer/:id (endpoints admin). Difere de SiteCareer (DTO
// publico usado pela listagem de empresas autenticada).
export interface SiteConfig {
  id: number
  site_name: string
  base_url: string
  allowed_hosts: string[]
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
  embedded_json_selector: string | null
  pagination_url_template: string | null
  created_at: string
}
