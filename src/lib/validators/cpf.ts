// Valida CPF brasileiro: 11 dígitos + DV mod 11.
// Rejeita sequências repetidas (passam no DV mas não são CPFs válidos).
export function isValidCPF(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 11) return false

  if (/^(\d)\1{10}$/.test(digits)) return false

  if (!checkDV(digits, 9, 10)) return false
  return checkDV(digits, 10, 11)
}

function checkDV(digits: string, prefixLen: number, weightStart: number): boolean {
  let sum = 0
  for (let i = 0; i < prefixLen; i++) {
    sum += Number(digits[i]) * (weightStart - i)
  }
  const rem = sum % 11
  const expected = rem < 2 ? 0 : 11 - rem
  return Number(digits[prefixLen]) === expected
}
