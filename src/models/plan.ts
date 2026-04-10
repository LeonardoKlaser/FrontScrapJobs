export interface Plan {
  id: number
  name: string
  price: number
  max_sites: number
  max_ai_analyses: number
  max_pdf_extractions: number
  max_suggestion_applies: number
  max_pdf_generations: number
  features: string[]
}
