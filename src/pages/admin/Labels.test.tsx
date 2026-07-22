import { render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'tool-locator:session:v1',
    JSON.stringify({ email: 'admin@tmmin.local' }),
  )
})

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/labels']}>
      <App />
    </MemoryRouter>,
  )
}

test('membuat satu label untuk setiap tools', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getAllByTestId('qr-label')).toHaveLength(8)
  })
})

test('setiap label memuat nama dan lokasi tools', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  })
  expect(screen.getAllByText('Melting · Rak A · Level 1').length).toBeGreaterThan(0)
})

// Gap: test di atas hanya membuktikan teks lokasi "Melting · Rak A · Level 1"
// muncul DI SUATU TEMPAT di halaman. Kalau implementasi keliru menempelkan
// lokasi tools pertama ke SEMUA label (bug penukaran location_id), test di
// atas tetap lolos karena tidak pernah memeriksa label mana yang memuat teks
// itu. Test ini memakai `within()` untuk memastikan setiap label memasangkan
// nama tools-nya sendiri dengan lokasinya sendiri, memakai dua tools dengan
// lokasi berbeda (Sekop Pasir → Pouring · Rak B · Bin 3, Thermocouple Probe
// → Analysis · Rak C · Level 1) sehingga penukaran lokasi antar-label akan
// terdeteksi.
test('setiap label memasangkan nama tools dengan lokasi yang benar', async () => {
  // Test di atas hanya membuktikan sebuah teks lokasi muncul di suatu
  // tempat di halaman — bukan bahwa ia berpasangan dengan tools yang
  // benar. Memeriksa hanya 1-2 tools sampel tidak cukup: menukar lokasi
  // antara dua tools LAIN yang tidak ikut diperiksa tetap lolos. Test ini
  // menyapu seluruh 8 tools seed sekaligus.
  renderPage()
  await waitFor(() => {
    expect(screen.getAllByTestId('qr-label')).toHaveLength(8)
  })

  const pasangan: Array<[string, string]> = [
    ['Kunci Pas 12', 'Melting · Rak A · Level 1'],
    ['Tang Kombinasi', 'Melting · Rak A · Level 1'],
    ['Palu Karet', 'Melting · Rak A · Level 2'],
    ['Sarung Tangan Tahan Panas', 'Melting · Rak A · Level 2'],
    ['Thermocouple Probe', 'Analysis · Rak C · Level 1'],
    ['Gelas Ukur Sampel', 'Analysis · Rak C · Level 1'],
    ['Ladle Skimmer', 'Pouring · Rak B · Level 1'],
    ['Sekop Pasir', 'Pouring · Rak B · Bin 3'],
  ]

  for (const [nama, lokasi] of pasangan) {
    const label = screen.getByText(nama).closest('[data-testid="qr-label"]')
    expect(within(label as HTMLElement).getByText(lokasi)).toBeInTheDocument()
  }
})

test('menyediakan tombol cetak', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /cetak/i })).toBeInTheDocument()
  })
})
