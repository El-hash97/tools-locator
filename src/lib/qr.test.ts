import { describe, expect, test } from 'vitest'
import { buildQrUrl, parseScannedValue } from './qr'

describe('buildQrUrl', () => {
  test('membentuk URL pengembalian', () => {
    expect(buildQrUrl('https://tloc.app', 'tool-001')).toBe(
      'https://tloc.app/return/tool-001',
    )
  })

  test('tidak menghasilkan garis miring ganda', () => {
    expect(buildQrUrl('https://tloc.app/', 'tool-001')).toBe(
      'https://tloc.app/return/tool-001',
    )
  })
})

describe('parseScannedValue', () => {
  test('mengambil id dari URL penuh', () => {
    expect(parseScannedValue('https://tloc.app/return/tool-001')).toBe('tool-001')
  })

  test('mengambil id dari URL dengan garis miring di akhir', () => {
    expect(parseScannedValue('https://tloc.app/return/tool-001/')).toBe('tool-001')
  })

  test('menerima id telanjang', () => {
    expect(parseScannedValue('tool-001')).toBe('tool-001')
  })

  test('mengabaikan spasi di tepi', () => {
    expect(parseScannedValue('  tool-001  ')).toBe('tool-001')
  })

  test('menolak QR asing', () => {
    expect(parseScannedValue('https://promo.example.com/diskon')).toBeNull()
    expect(parseScannedValue('halo dunia')).toBeNull()
    expect(parseScannedValue('')).toBeNull()
  })
})
