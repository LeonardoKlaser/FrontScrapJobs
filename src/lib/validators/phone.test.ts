import { describe, it, expect } from 'vitest'
import { isValidBRCellphone } from './phone'

describe('isValidBRCellphone', () => {
  it.each([
    ['valido com mascara', '(11) 91234-5678', true],
    ['valido sem mascara', '11912345678', true],
    ['valido outro DDD', '(85) 99876-5432', true],
    ['fixo 10 digitos', '(11) 1234-5678', false],
    ['3o digito nao 9', '(11) 81234-5678', false],
    ['curto', '1191234567', false],
    ['longo', '119123456789', false],
    ['vazio', '', false]
  ])('%s', (_name, input, expected) => {
    expect(isValidBRCellphone(input)).toBe(expected)
  })
})
