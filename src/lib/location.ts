const BRAZIL_KEYWORDS = [
  'brasil',
  'brazil',
  'osasco',
  'campinas',
  'curitiba',
  'florianópolis',
  'florianopolis',
  'porto alegre',
  'belo horizonte',
  'recife',
  'fortaleza',
  'salvador',
  'brasília',
  'brasilia',
  'manaus',
  'belém',
  'belem',
  'goiânia',
  'goiania',
  'guarulhos',
  'são bernardo',
  'sao bernardo',
  'santo andré',
  'santo andre',
  'são josé',
  'sao jose',
  'joinville',
  'londrina',
  'maringá',
  'maringa',
  'niterói',
  'niteroi',
  'são leopoldo',
  'sao leopoldo',
  'acre',
  'alagoas',
  'amapá',
  'amapa',
  'amazonas',
  'bahia',
  'ceará',
  'ceara',
  'distrito federal',
  'espírito santo',
  'espirito santo',
  'goiás',
  'goias',
  'maranhão',
  'maranhao',
  'mato grosso',
  'mato grosso do sul',
  'minas gerais',
  'pará',
  'para',
  'paraíba',
  'paraiba',
  'paraná',
  'parana',
  'pernambuco',
  'piauí',
  'piaui',
  'rio de janeiro',
  'rio grande do norte',
  'rio grande do sul',
  'rondônia',
  'rondonia',
  'roraima',
  'santa catarina',
  'são paulo',
  'sao paulo',
  'sergipe',
  'tocantins'
]

const BRAZIL_ACRONYMS_REGEX = new RegExp(
  '(?:^|[\\s,\\-/])' +
    '(BR|AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|' +
    'RJ|RN|RS|RO|RR|SC|SP|SE|TO)' +
    '(?:[\\s,\\-/]|$)'
)

export type LocationCategory = 'Remote' | 'National' | 'International' | 'Unknown'

export function categorizeLocation(location: string): LocationCategory {
  if (!location) return 'Unknown'

  const normalizedLoc = location.toLowerCase()

  if (normalizedLoc.includes('remot')) return 'Remote'

  const hasKeyword = BRAZIL_KEYWORDS.some((kw) => normalizedLoc.includes(kw))
  const hasAcronym = BRAZIL_ACRONYMS_REGEX.test(location)

  if (hasKeyword || hasAcronym) return 'National'

  return 'International'
}
