import { describe, expect, test } from 'vitest'
import { levenshtein, matchScore, searchByName } from './fuzzy'

describe('levenshtein', () => {
  test('menghitung jarak antar kata', () => {
    expect(levenshtein('kunci', 'kunci')).toBe(0)
    expect(levenshtein('kunci', 'kunsi')).toBe(1)
    expect(levenshtein('', 'palu')).toBe(4)
  })
})

describe('matchScore', () => {
  test('memberi skor 0 untuk kecocokan substring', () => {
    expect(matchScore('kunci', 'Kunci Pas 12')).toBe(0)
    expect(matchScore('pas', 'Kunci Pas 12')).toBe(0)
  })

  test('tidak peduli huruf besar/kecil', () => {
    expect(matchScore('KUNCI', 'Kunci Pas 12')).toBe(0)
  })

  test('tetap menemukan hasil walau ejaan sedikit salah', () => {
    expect(matchScore('kunsi', 'Kunci Pas 12')).toBe(1)
    expect(matchScore('tang kombinasi', 'Tang Kombinasi')).toBe(0)
    expect(matchScore('kombinasl', 'Tang Kombinasi')).toBe(1)
  })

  test('menolak kata yang jelas tidak relevan', () => {
    expect(matchScore('palu', 'Kunci Pas 12')).toBeNull()
    expect(matchScore('thermocouple', 'Sekop Pasir')).toBeNull()
  })

  test('query kosong mencocokkan apa saja', () => {
    expect(matchScore('', 'Kunci Pas 12')).toBe(0)
  })

  test('query sangat pendek tidak ditoleransi typo-nya', () => {
    // Query 3 huruf terlalu pendek — toleransi typo akan mencocokkan
    // hampir semua hal dan hasilnya jadi sampah.
    expect(matchScore('pal', 'Pas')).toBeNull()
  })
})

describe('searchByName', () => {
  const tools = [
    { nama: 'Kunci Pas 12' },
    { nama: 'Tang Kombinasi' },
    { nama: 'Kunsi Inggris' },
  ]
  const getText = (t: { nama: string }) => t.nama

  test('mengembalikan semua item untuk query kosong', () => {
    expect(searchByName(tools, '', getText)).toHaveLength(3)
  })

  test('mendahulukan cocok persis di atas cocok fuzzy', () => {
    const result = searchByName(tools, 'kunci', getText)
    expect(result[0].nama).toBe('Kunci Pas 12')
    expect(result.map((t) => t.nama)).toContain('Kunsi Inggris')
  })

  test('membuang item yang tidak cocok', () => {
    const result = searchByName(tools, 'kunci', getText)
    expect(result.map((t) => t.nama)).not.toContain('Tang Kombinasi')
  })
})
