import { render, screen, waitFor } from '@testing-library/react'
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

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan instruksi pengembalian dan lokasi lengkap', async () => {
  renderAt('/return/tool-001')

  await waitFor(() => {
    expect(screen.getByText(/kembalikan ke sini/i)).toBeInTheDocument()
  })

  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument()
})

test('memberi pesan jelas saat QR menunjuk tools yang sudah dihapus', async () => {
  renderAt('/return/tool-sudah-dihapus')

  await waitFor(() => {
    expect(screen.getByText(/tools tidak ditemukan/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: /kembali ke pencarian/i })).toBeInTheDocument()
})

test('menampilkan error, bukan "tidak ditemukan", saat data gagal dimuat', async () => {
  // Ini halaman yang dilihat MP tepat setelah scan QR untuk mengembalikan
  // tools. Tanpa cabang error, kegagalan memuat data terlihat sama seperti
  // QR yang tidak dikenali — pesan yang salah di momen paling penting.
  vi.spyOn(MockRepository.prototype, 'getTools').mockRejectedValue(
    new Error('Penyimpanan rusak'),
  )

  renderAt('/return/tool-001')

  await waitFor(() => {
    expect(screen.getByText(/gagal memuat data/i)).toBeInTheDocument()
  })
  expect(screen.queryByText(/tools tidak ditemukan/i)).not.toBeInTheDocument()
})

test('memberi tahu saat foto penempatan belum diunggah', async () => {
  renderAt('/return/tool-001')

  await waitFor(() => {
    expect(screen.getByText(/foto penempatan belum diunggah/i)).toBeInTheDocument()
  })
})
