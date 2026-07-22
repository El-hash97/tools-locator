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
test('setiap label memasangkan nama dan lokasi tools miliknya sendiri', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getAllByTestId('qr-label')).toHaveLength(8)
  })

  const labels = screen.getAllByTestId('qr-label')

  const sekopLabel = labels.find((label) => within(label).queryByText('Sekop Pasir'))
  expect(sekopLabel).toBeDefined()
  expect(
    within(sekopLabel!).getByText('Pouring · Rak B · Bin 3'),
  ).toBeInTheDocument()

  const thermoLabel = labels.find((label) =>
    within(label).queryByText('Thermocouple Probe'),
  )
  expect(thermoLabel).toBeDefined()
  expect(
    within(thermoLabel!).getByText('Analysis · Rak C · Level 1'),
  ).toBeInTheDocument()
})

test('menyediakan tombol cetak', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /cetak/i })).toBeInTheDocument()
  })
})
