import { describe, expect, test } from 'vitest'
import { fitDimensions } from './image'

describe('fitDimensions', () => {
  test('mengecilkan gambar landscape ke sisi terpanjang', () => {
    expect(fitDimensions(1600, 1200, 800)).toEqual({ width: 800, height: 600 })
  })

  test('mengecilkan gambar portrait ke sisi terpanjang', () => {
    expect(fitDimensions(1200, 1600, 800)).toEqual({ width: 600, height: 800 })
  })

  test('membiarkan gambar yang sudah kecil apa adanya', () => {
    expect(fitDimensions(400, 300, 800)).toEqual({ width: 400, height: 300 })
  })

  test('menangani gambar persegi', () => {
    expect(fitDimensions(1000, 1000, 800)).toEqual({ width: 800, height: 800 })
  })
})
