import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from '@/App'

beforeEach(() => {
  localStorage.clear()
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan detail lengkap tools', async () => {
  renderAt('/tools/tool-005')

  await waitFor(() => {
    expect(screen.getByText('Thermocouple Probe')).toBeInTheDocument()
  })

  expect(screen.getByText('Alat Ukur')).toBeInTheDocument()
  expect(screen.getByText('2 pcs')).toBeInTheDocument()
  expect(screen.getByText('Analysis · Rak C · Level 1')).toBeInTheDocument()
  expect(screen.getByText(/tangani hati-hati/i)).toBeInTheDocument()
})

test('menyediakan tautan ke halaman penempatan', async () => {
  renderAt('/tools/tool-005')

  await waitFor(() => {
    expect(screen.getByRole('link', { name: /lihat penempatan/i })).toHaveAttribute(
      'href',
      '/return/tool-005',
    )
  })
})

test('memberi pesan jelas saat tools tidak ada', async () => {
  renderAt('/tools/tool-tidak-ada')

  await waitFor(() => {
    expect(screen.getByText(/tools tidak ditemukan/i)).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: /kembali ke pencarian/i })).toBeInTheDocument()
})
