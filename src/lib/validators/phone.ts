// Valida celular brasileiro: 11 dígitos com 9 obrigatório no 3º (regra Anatel pós-2014).
export function isValidBRCellphone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 11) return false
  return digits[2] === '9'
}
