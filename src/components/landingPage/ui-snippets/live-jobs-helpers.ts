import type { RecentJob } from '@/services/publicJobsService'

// A API devolve o nome do site de scraping ("QuintoAndar Carreiras"), não o da
// empresa. O sufixo só é removido no fim, pra não mutilar nomes como
// "Carreiras do Sul".
const COMPANY_SUFFIX = /\s+(Carreiras|Careers|Carreira|Vagas|Jobs)$/i

export function cleanCompanyName(name: string): string {
  return name.trim().replace(COMPANY_SUFFIX, '')
}

type PostedAgoKey = 'hero.panel.now' | 'hero.panel.hoursAgo' | 'hero.panel.daysAgo'

// Devolve a chave i18n e o número a interpolar — a tradução em si fica no
// componente, que é quem tem o `t`.
export function postedAgoKey(hours: number): { key: PostedAgoKey; count: number } {
  if (hours <= 0) return { key: 'hero.panel.now', count: 0 }
  if (hours < 24) return { key: 'hero.panel.hoursAgo', count: hours }
  return { key: 'hero.panel.daysAgo', count: Math.floor(hours / 24) }
}

// Usada quando logo_url vem vazio — o SQL do backend faz COALESCE(logo_url,'').
export function companyInitial(name: string): string {
  const clean = cleanCompanyName(name)
  return clean.length > 0 ? clean[0].toUpperCase() : '?'
}

// Vagas reais capturadas de produção em 2026-08-04, exibidas apenas quando a
// API falha. São 4 pra que o painel tenha a mesma altura em loading, live e
// fallback. posted_hours_ago fica 0: o estado de fallback não mostra tempo.
export const FALLBACK_JOBS: RecentJob[] = [
  {
    title: 'Senior Software Engineer - IAM',
    company: 'QuintoAndar',
    logo_url: '',
    posted_hours_ago: 0
  },
  {
    title: 'SRE Sênior | Cartões',
    company: 'PicPay',
    logo_url: '',
    posted_hours_ago: 0
  },
  {
    title: 'Sr. Data Analyst',
    company: 'Pinterest',
    logo_url: '',
    posted_hours_ago: 0
  },
  {
    title: 'Product Owner Pleno - IA',
    company: 'Globo',
    logo_url: '',
    posted_hours_ago: 0
  }
]
