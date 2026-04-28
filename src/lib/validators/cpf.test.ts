import { describe, it, expect } from 'vitest'
import { isValidCPF } from './cpf'

describe('isValidCPF', () => {
  it.each([
    ['valido com mascara', '123.456.789-09', true],
    ['valido sem mascara', '12345678909', true],
    ['sequencia repetida 11111111111', '11111111111', false],
    ['sequencia repetida 00000000000', '00000000000', false],
    ['DV invalido', '12345678900', false],
    ['comprimento curto', '1234567890', false],
    ['comprimento longo', '123456789090', false],
    ['vazio', '', false],
    ['so letras', 'abcdefghijk', false],
    ['valido conhecido', '529.982.247-25', true]
  ])('%s', (_name, input, expected) => {
    expect(isValidCPF(input)).toBe(expected)
  })
})
