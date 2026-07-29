import { AxiosError } from 'axios'

export const GENERIC_MUTATION_ERROR = 'Erro ao processar a requisição.'

// Erros do backend chegam em dois formatos: frases prontas pra humano
// ("Credenciais inválidas") e slugs de máquina ("ai_unavailable") que cada
// fluxo traduz em contexto. O toast global de mutations (main.tsx) só pode
// exibir o primeiro tipo — slug cru na tela é jargão.
const SLUG_PATTERN = /^[a-z0-9_.-]+$/

export function mutationErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { error?: string } | undefined
    if (data?.error && !SLUG_PATTERN.test(data.error)) return data.error
  }
  return GENERIC_MUTATION_ERROR
}
