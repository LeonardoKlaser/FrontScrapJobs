export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard'

// Prefixos BIN da Elo - lista compilada uma vez na carga do módulo.
// Ordem importa: bandeiras mais específicas (Elo/Hipercard) antes de Visa/Master,
// porque alguns BINs Elo começam com 4 ou 5 e seriam confundidos.
const ELO_PREFIXES = [
  '401178',
  '401179',
  '438935',
  '451416',
  '457631',
  '457393',
  '504175',
  '506699',
  '627780',
  '636297',
  '636368'
]
const ELO_RANGE_PATTERNS = [/^509[0-9]{3}/, /^650(03[1-9]|04[0-9]|05[01])/]

function isElo(digits: string): boolean {
  if (ELO_PREFIXES.some((p) => digits.startsWith(p))) return true
  return ELO_RANGE_PATTERNS.some((re) => re.test(digits))
}

export function detectBrand(input: string): CardBrand | null {
  const digits = input.replace(/\D/g, '')
  if (!digits) return null

  if (isElo(digits)) return 'elo'
  if (/^(606282|3841)/.test(digits)) return 'hipercard'
  if (/^3[47]/.test(digits)) return 'amex'
  if (/^4/.test(digits)) return 'visa'
  // Mastercard: 51-55 OU range 2-series 2221-2720 (não basta /^2[2-7]/, que pega
  // 2200-2220 e 2721-2799 — fora do range válido).
  if (/^5[1-5]/.test(digits)) return 'mastercard'
  if (/^(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) {
    return 'mastercard'
  }

  return null
}
