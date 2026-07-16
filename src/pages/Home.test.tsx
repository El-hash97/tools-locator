import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'
import { MockRepository } from '@/data/mockRepository'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
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

test('menggabungkan filter kategori dengan pencarian', async () => {
  const user = userEvent.setup()
  renderHome()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  // "kunci" cocok persis dengan Kunci Pas 12, tapi tools itu ada di kategori
  // lain. Kalau filter kategori tidak ikut diterapkan, ia akan muncul.
  await user.click(screen.getByRole('button', { name: 'Alat Ukur' }))
  await user.type(screen.getByPlaceholderText(/cari tools/i), 'kunci')

  expect(screen.queryByText('Kunci Pas 12')).not.toBeInTheDocument()
  expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument()
})

test('menampilkan error, bukan "tidak ditemukan", saat data gagal dimuat', async () => {
  // Tanpa test ini, menghapus penjaga `!error` dari pesan kosong lolos
  // seluruh suite. Akibatnya MP yang penyimpanannya error diberi tahu
  // "Tools tidak ditemukan" lalu pergi — mengira tools-nya memang tidak ada,
  // bukan bahwa aplikasinya rusak.
  vi.spyOn(MockRepository.prototype, 'getTools').mockRejectedValue(
    new Error('Penyimpanan rusak'),
  )

  renderHome()

  await waitFor(() => {
    expect(screen.getByText('Penyimpanan rusak')).toBeInTheDocument()
  })
  expect(screen.queryByText(/tidak ditemukan/i)).not.toBeInTheDocument()
})
