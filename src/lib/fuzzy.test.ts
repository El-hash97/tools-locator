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

  test('menemukan kata panjang lewat awalannya yang salah ketik', () => {
    // Menguji cabang prefix secara khusus: query lebih pendek dari katanya,
    // sehingga jarak ke kata utuh jauh (>2) dan hanya perbandingan awalan
    // yang bisa menemukannya. Tanpa cabang itu, ini null.
    expect(matchScore('termoc', 'Thermocouple Probe')).toBe(2)
  })

  test('menolak kata yang jelas tidak relevan', () => {
    expect(matchScore('palu', 'Kunci Pas 12')).toBeNull()
    expect(matchScore('thermocouple', 'Sekop Pasir')).toBeNull()
  })

  test('query kosong mencocokkan apa saja', () => {
    expect(matchScore('', 'Kunci Pas 12')).toBe(0)
  })

  test('query pendek tidak ditoleransi typo-nya', () => {
    // 3 huruf.
    expect(matchScore('pal', 'Pas')).toBeNull()
    // 4 huruf: tanpa aturan ini, "pasu" memunculkan tiga tools berbeda dan
    // "paku" memunculkan Palu Karet.
    expect(matchScore('pasu', 'Kunci Pas 12')).toBeNull()
    expect(matchScore('pasu', 'Sekop Pasir')).toBeNull()
    expect(matchScore('paku', 'Palu Karet')).toBeNull()
  })
})

describe('searchByName', () => {
  // Urutan sengaja dibalik: yang cocok fuzzy ditaruh SEBELUM yang cocok
  // persis. Kalau fixture-nya sudah urut, menghapus sort() tetap membuat
  // test lulus — dan urutan hasil tidak benar-benar teruji.
  const tools = [
    { nama: 'Kunsi Inggris' },
    { nama: 'Tang Kombinasi' },
    { nama: 'Kunci Pas 12' },
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
