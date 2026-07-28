import { describe, it, expect } from 'vitest'
import ptBR from '../pt-BR/curriculum.json'
import enUS from '../en-US/curriculum.json'

// Slugs de erro que o backend de /api/curriculum-files pode devolver (ver
// src/lib/curriculumFileErrorKey.ts) — cada um precisa de uma tradução em
// errors.<slug> nos dois locales, senão o toast mapeado quebra em silêncio.
const ERROR_SLUGS = [
  'invalid_format',
  'too_large',
  'limit_reached',
  'not_found',
  'invalid_id',
  'storage_unavailable',
  'internal_error'
]

function collectKeyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return collectKeyPaths(value, path)
  })
}

describe('curriculum i18n namespace — paridade pt-BR / en-US', () => {
  it('tem exatamente o mesmo conjunto de chaves nos dois locales', () => {
    const ptKeys = collectKeyPaths(ptBR).sort()
    const enKeys = collectKeyPaths(enUS).sort()

    expect(enKeys).toEqual(ptKeys)
  })

  it.each(ERROR_SLUGS)('mapeia o slug de erro "%s" nos dois locales', (slug) => {
    expect(ptBR.errors).toHaveProperty(slug)
    expect(enUS.errors).toHaveProperty(slug)
    expect(typeof ptBR.errors[slug as keyof typeof ptBR.errors]).toBe('string')
    expect(typeof enUS.errors[slug as keyof typeof enUS.errors]).toBe('string')
    expect((ptBR.errors[slug as keyof typeof ptBR.errors] as string).length).toBeGreaterThan(0)
    expect((enUS.errors[slug as keyof typeof enUS.errors] as string).length).toBeGreaterThan(0)
  })

  it('tem uma mensagem de erro de listagem (list.errorState) não vazia nos dois locales', () => {
    expect(ptBR.list.errorState.length).toBeGreaterThan(0)
    expect(enUS.list.errorState.length).toBeGreaterThan(0)
  })
})
