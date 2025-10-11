export interface SiteCareer {
    SiteId: number;
    SiteName: string;
    BaseURL: string;
    LogoURL: string;
    IsSubscribed: boolean;
  }

export interface UserSiteRequest{
    site_id: number
    target_words: string[]
}