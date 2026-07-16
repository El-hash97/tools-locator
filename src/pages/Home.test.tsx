import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
})

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan semua tools saat pencarian kosong', async () => {
  renderHome()
  await waitFor(() => {
    expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  })
  expect(screen.getByText('Sekop Pasir')).toBeInTheDocument()
})

test('menyaring tools sesuai kata pencarian', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.type(screen.getByPlaceholderText(/cari tools/i), 'kunci')

  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  expect(screen.queryByText('Sekop Pasir')).not.toBeInTheDocument()
})

test('tetap menemukan tools walau ejaan sedikit salah', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.type(screen.getByPlaceholderText(/cari tools/i), 'kunsi')

  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
})

test('menyaring lewat chip kategori', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: 'Alat Ukur' }))

  expect(screen.getByText('Thermocouple Probe')).toBeInTheDocument()
  expect(screen.queryByText('Kunci Pas 12')).not.toBeInTheDocument()
})

test('menampilkan jumlah dan lokasi ringkas pada kartu', async () => {
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  expect(screen.getByText('4 pcs')).toBeInTheDocument()
  expect(screen.getAllByText(/Melting · Rak A/).length).toBeGreaterThan(0)
})

test('memberi tahu saat tidak ada hasil', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.type(screen.getByPlaceholderText(/cari tools/i), 'xyzabc')

  expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument()
})
