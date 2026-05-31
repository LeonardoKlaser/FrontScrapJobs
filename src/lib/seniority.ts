export const SENIORITY_GROUPS = {
  estagio: ['estagio', 'estagiario', 'estagiaria', 'intern', 'internship', 'trainee', 'talentos'],
  junior: ['junior', 'jr']
} as const

export type SeniorityLevel = keyof typeof SENIORITY_GROUPS

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  estagio: 'Estágio',
  junior: 'Júnior'
}

export function detectSeniorityFromKeywords(
  siteKeywords: Array<{ keyword: string }>
): SeniorityLevel[] {
  const found = new Set<SeniorityLevel>()
  for (const { keyword } of siteKeywords) {
    for (const [level, terms] of Object.entries(SENIORITY_GROUPS) as [
      SeniorityLevel,
      readonly string[]
    ][]) {
      if ((terms as readonly string[]).includes(keyword)) {
        found.add(level)
      }
    }
  }
  return Array.from(found)
}

export function termsForLevel(
  level: SeniorityLevel,
  siteKeywords: Array<{ keyword: string }>
): string[] {
  return SENIORITY_GROUPS[level].filter((term) => siteKeywords.some((sk) => sk.keyword === term))
}
