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

  test('mengecilkan walau hanya satu sisi yang melebihi batas', () => {
    // Tanpa kasus ini, mengganti `&&` menjadi `||` pada penjaga bounds lolos
    // seluruh test lain — padahal foto seperti ini tidak akan dikecilkan
    // sama sekali.
    expect(fitDimensions(1000, 400, 800)).toEqual({ width: 800, height: 320 })
    expect(fitDimensions(400, 1000, 800)).toEqual({ width: 320, height: 800 })
  })

  test('menjaga proporsi pada rasio ekstrem', () => {
    expect(fitDimensions(4000, 200, 800)).toEqual({ width: 800, height: 40 })
  })

  test('membulatkan, bukan memotong', () => {
    // 417 * 0.8 = 333,6. Math.floor akan memberi 333 dan lolos diam-diam
    // pada kasus-kasus lain yang kebetulan bulat.
    expect(fitDimensions(1000, 417, 800)).toEqual({ width: 800, height: 334 })
  })
})
