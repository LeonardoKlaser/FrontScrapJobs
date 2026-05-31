import { describe, expect, it } from 'vitest'
import {
  detectSeniorityFromKeywords,
  termsForLevel,
  SENIORITY_GROUPS,
  SENIORITY_LABELS
} from './seniority'

describe('detectSeniorityFromKeywords', () => {
  it('detecta junior quando keyword "jr" está presente', () => {
    const kws = [{ keyword: 'jr' }, { keyword: 'react' }]
    expect(detectSeniorityFromKeywords(kws)).toContain('junior')
  })

  it('detecta estagio quando keyword "intern" está presente', () => {
    const kws = [{ keyword: 'intern' }, { keyword: 'python' }]
    expect(detectSeniorityFromKeywords(kws)).toContain('estagio')
  })

  it('detecta ambos quando os dois grupos estão presentes', () => {
    const kws = [{ keyword: 'junior' }, { keyword: 'trainee' }]
    const result = detectSeniorityFromKeywords(kws)
    expect(result).toContain('junior')
    expect(result).toContain('estagio')
  })

  it('retorna vazio para keywords sem indicador de senioridade', () => {
    const kws = [{ keyword: 'react' }, { keyword: 'typescript' }]
    expect(detectSeniorityFromKeywords(kws)).toHaveLength(0)
  })

  it('retorna vazio para lista vazia', () => {
    expect(detectSeniorityFromKeywords([])).toHaveLength(0)
  })

  it('não duplica níveis quando múltiplos termos do mesmo grupo estão presentes', () => {
    const kws = [{ keyword: 'junior' }, { keyword: 'jr' }]
    const result = detectSeniorityFromKeywords(kws)
    expect(result.filter((l) => l === 'junior')).toHaveLength(1)
  })
})

describe('termsForLevel', () => {
  it('retorna apenas os termos que existem nos keywords do site', () => {
    const kws = [{ keyword: 'jr' }, { keyword: 'react' }]
    const result = termsForLevel('junior', kws)
    expect(result).toEqual(['jr'])
    expect(result).not.toContain('junior')
  })

  it('retorna vazio se nenhum termo do nível existe nos keywords', () => {
    const kws = [{ keyword: 'react' }, { keyword: 'python' }]
    expect(termsForLevel('junior', kws)).toHaveLength(0)
  })

  it('retorna todos os termos do nível que existem nos keywords', () => {
    const kws = [...SENIORITY_GROUPS.estagio].map((k) => ({ keyword: k }))
    expect(termsForLevel('estagio', kws)).toEqual(
      expect.arrayContaining([...SENIORITY_GROUPS.estagio])
    )
  })
})

describe('SENIORITY_LABELS', () => {
  it('tem label para junior', () => {
    expect(SENIORITY_LABELS.junior).toBe('Júnior')
  })

  it('tem label para estagio', () => {
    expect(SENIORITY_LABELS.estagio).toBe('Estágio')
  })
})
