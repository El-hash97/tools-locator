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

  test('menerima URL dari host lain — disengaja, bukan kelalaian', () => {
    // Host tidak diperiksa dengan sengaja: id hanya dipakai untuk navigasi
    // internal, dan memeriksa host akan membuat label yang dicetak sebelum
    // pindah domain berhenti bisa di-scan. Test ini mengunci keputusan itu
    // supaya tidak "diperbaiki" tanpa membaca alasannya.
    expect(parseScannedValue('https://host-lain.example/return/tool-001')).toBe(
      'tool-001',
    )
  })

  test('menerima id UUID dari tools yang dibuat saat runtime', () => {
    // Tools baru memakai crypto.randomUUID(). Kalau regex menolak bentuk ini,
    // label tools yang baru dibuat tidak akan bisa di-scan sama sekali.
    const uuid = '3f2504e0-4f89-11d3-9a0c-0305e82c3301'
    expect(parseScannedValue(uuid)).toBe(uuid)
    expect(parseScannedValue(`https://tloc.app/return/${uuid}`)).toBe(uuid)
  })
})
