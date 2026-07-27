import { describe, it, expect } from 'vitest'
import { formatPhoneBR, formatCPF, formatCpfCnpj, formatFileSize } from './format'

describe('formatPhoneBR', () => {
  it.each([
    ['', ''],
    ['1', '(1'],
    ['11', '(11'],
    ['1191234', '(11) 9123-4'],
    ['1191234567', '(11) 9123-4567'],
    ['11912345678', '(11) 91234-5678'],
    ['119123456789', '(11) 91234-5678']
  ])('formats %s -> %s', (input, expected) => {
    expect(formatPhoneBR(input)).toBe(expected)
  })
})

describe('formatCPF', () => {
  it.each([
    ['', ''],
    ['123', '123'],
    ['1234567', '123.456.7'],
    ['12345678909', '123.456.789-09'],
    ['123456789090', '123.456.789-09']
  ])('formats %s -> %s', (input, expected) => {
    expect(formatCPF(input)).toBe(expected)
  })
})

describe('formatCpfCnpj', () => {
  it.each([
    ['', ''],
    ['12345678909', '123.456.789-09'],
    ['12345678', '123.456.78'],
    ['12345678000195', '12.345.678/0001-95'],
    ['1234567800019', '12.345.678/0001-9'],
    ['123456789012345', '12.345.678/9012-34']
  ])('formats %s -> %s', (input, expected) => {
    expect(formatCpfCnpj(input)).toBe(expected)
  })
})

describe('formatFileSize', () => {
  it.each([
    [0, '0 B'],
    [512, '512 B'],
    [1024, '1.0 KB'],
    [2048, '2.0 KB'],
    [10240, '10 KB'],
    [1024 * 1024, '1.0 MB'],
    [10.5 * 1024 * 1024, '10.5 MB']
  ])('formats %i bytes -> %s', (input, expected) => {
    expect(formatFileSize(input)).toBe(expected)
  })
})
