import { describe, expect, test } from 'vitest'
import { formatLocation } from './format'

describe('formatLocation', () => {
  test('menggabungkan area, rak, dan level/bin', () => {
    expect(
      formatLocation({
        id: 'loc-1',
        area: 'Melting',
        rak: 'Rak A',
        level_bin: 'Level 2',
      }),
    ).toBe('Melting · Rak A · Level 2')
  })

  test('menangani lokasi yang tidak ditemukan', () => {
    expect(formatLocation(undefined)).toBe('Lokasi belum diatur')
  })
})
