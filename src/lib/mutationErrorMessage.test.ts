import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { mutationErrorMessage, GENERIC_MUTATION_ERROR } from './mutationErrorMessage'

function axiosErrorWith(error?: string): AxiosError {
  const err = new AxiosError('Request failed')
  err.response = { data: error === undefined ? {} : { error } } as AxiosError['response']
  return err
}

describe('mutationErrorMessage', () => {
  it('repassa mensagens humanas do backend', () => {
    expect(mutationErrorMessage(axiosErrorWith('Credenciais inválidas'))).toBe(
      'Credenciais inválidas'
    )
  })

  it('troca slugs de máquina pela mensagem genérica', () => {
    expect(mutationErrorMessage(axiosErrorWith('ai_unavailable'))).toBe(GENERIC_MUTATION_ERROR)
    expect(mutationErrorMessage(axiosErrorWith('no_curriculum'))).toBe(GENERIC_MUTATION_ERROR)
  })

  it('cai na genérica sem data.error ou sem AxiosError', () => {
    expect(mutationErrorMessage(axiosErrorWith(undefined))).toBe(GENERIC_MUTATION_ERROR)
    expect(mutationErrorMessage(new Error('boom'))).toBe(GENERIC_MUTATION_ERROR)
  })
})
