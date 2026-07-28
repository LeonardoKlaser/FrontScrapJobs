export interface Plan {
  id: number
  name: string
  price: number
  max_sites: number
  max_ai_analyses: number
  is_trial: boolean
  features: string[]
  // Marca o plano Ultra, que cobre automaticamente todas as empresas.
  is_ultra?: boolean
}
