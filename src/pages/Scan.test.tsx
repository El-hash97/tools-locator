import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'

const startMock = vi.fn()
const stopMock = vi.fn()

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    start = startMock
    stop = stopMock
    clear = vi.fn()
  },
}))

beforeEach(() => {
  localStorage.clear()
  startMock.mockReset().mockResolvedValue(undefined)
  stopMock.mockReset().mockResolvedValue(undefined)
})

function renderScan() {
  return render(
    <MemoryRouter initialEntries={['/scan']}>
      <App />
    </MemoryRouter>,
  )
}

test('menawarkan input manual saat izin kamera ditolak', async () => {
  startMock.mockRejectedValue(new Error('Permission denied'))
  renderScan()

  await waitFor(() => {
    expect(screen.getByText(/kamera tidak bisa dipakai/i)).toBeInTheDocument()
  })
  expect(screen.getByLabelText(/kode tools/i)).toBeInTheDocument()
})

test('membuka halaman pengembalian dari kode manual', async () => {
  const user = userEvent.setup()
  renderScan()

  await user.type(screen.getByLabelText(/kode tools/i), 'tool-001')
  await user.click(screen.getByRole('button', { name: /buka/i }))

  await waitFor(() => {
    expect(screen.getByText(/kembalikan ke sini/i)).toBeInTheDocument()
  })
  expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
})

test('menolak kode yang tidak dikenali', async () => {
  const user = userEvent.setup()
  renderScan()

  await user.type(screen.getByLabelText(/kode tools/i), 'halo dunia')
  await user.click(screen.getByRole('button', { name: /buka/i }))

  expect(screen.getByText(/kode tidak dikenali/i)).toBeInTheDocument()
})

test('menghentikan kamera saat halaman ditinggalkan', async () => {
  // Tanpa test ini, menghapus scanner.stop() dari cleanup unmount lolos
  // seluruh suite — dan kamera tetap menyala setelah MP pindah halaman.
  const { unmount } = renderScan()

  await waitFor(() => {
    expect(startMock).toHaveBeenCalled()
  })

  unmount()

  await waitFor(() => {
    expect(stopMock).toHaveBeenCalled()
  })
})

test('membersihkan scanner dengan aman walau start() belum selesai saat unmount', async () => {
  // Bug nyata di browser sungguhan (ditemukan di Task 18, tidak mungkin
  // tertangkap mock lama yang selalu mockResolvedValue): StrictMode
  // me-mount efek dua kali — mount pertama langsung di-cleanup sebelum
  // start() sempat selesai. html5-qrcode melempar error SINKRON kalau
  // stop() dipanggil sebelum scanner benar-benar berjalan, dan .catch()
  // tidak menangkapnya — seluruh halaman crash jadi layar kosong, persis
  // saat kamera gagal dan fallback manual paling dibutuhkan.
  startMock.mockReturnValue(new Promise(() => {})) // sengaja tidak pernah selesai
  stopMock.mockImplementation(() => {
    throw new Error('Cannot stop, scanner is not running or paused.')
  })

  const { unmount } = renderScan()

  await waitFor(() => {
    expect(startMock).toHaveBeenCalled()
  })

  expect(() => unmount()).not.toThrow()
})
