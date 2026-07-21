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
