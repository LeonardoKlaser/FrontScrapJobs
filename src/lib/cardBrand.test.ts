import { describe, it, expect } from 'vitest'
import { detectBrand } from './cardBrand'

describe('detectBrand', () => {
  it.each([
    ['4532123456789012', 'visa'],
    ['4111111111111111', 'visa'],
    ['5555555555554444', 'mastercard'],
    ['2221001234567890', 'mastercard'],
    ['378282246310005', 'amex'],
    ['371449635398431', 'amex'],
    ['6362970000457013', 'elo'],
    ['6062826786276634', 'hipercard']
  ])('detects %s as %s', (number, expected) => {
    expect(detectBrand(number)).toBe(expected)
  })

  it('handles formatted input with spaces', () => {
    expect(detectBrand('4532 1234 5678 9012')).toBe('visa')
  })

  it('returns null for empty string', () => {
    expect(detectBrand('')).toBeNull()
  })

  it('returns null for unknown prefix', () => {
    expect(detectBrand('9999999999999999')).toBeNull()
  })

  // Range-edge — Mastercard 2-series é estritamente 2221-2720
  it.each([
    ['2200000000000000', null], // abaixo do range
    ['2220000000000000', null],
    ['2221000000000000', 'mastercard'],
    ['2720000000000000', 'mastercard'],
    ['2721000000000000', null], // acima do range
    ['2790000000000000', null]
  ])('Mastercard 2-series boundary %s → %s', (number, expected) => {
    expect(detectBrand(number)).toBe(expected)
  })
})
