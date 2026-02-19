export interface SiteCareer {
  site_id: number
  site_name: string
  base_url: string
  logo_url: string
  is_subscribed: boolean
}

export interface UserSiteRequest {
  site_id: number
  target_words: string[]
}
