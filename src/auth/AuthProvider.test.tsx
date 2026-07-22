import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

test('menampilkan form login saat belum ada sesi', async () => {
  renderAt('/admin')
  await waitFor(() => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
  expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument()
})

test('menolak kredensial yang salah', async () => {
  const user = userEvent.setup()
  renderAt('/admin')

  await user.type(screen.getByLabelText(/email/i), 'admin@tmmin.local')
  await user.type(screen.getByLabelText(/kata sandi/i), 'salah')
  await user.click(screen.getByRole('button', { name: /masuk/i }))

  await waitFor(() => {
    expect(screen.getByText(/email atau kata sandi salah/i)).toBeInTheDocument()
  })
})

test('mengalihkan ke daftar tools setelah login berhasil', async () => {
  const user = userEvent.setup()
  renderAt('/admin')

  await user.type(screen.getByLabelText(/email/i), 'admin')
  await user.type(screen.getByLabelText(/kata sandi/i), 'admin123')
  await user.click(screen.getByRole('button', { name: /masuk/i }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /kelola tools/i })).toBeInTheDocument()
  })
})

test('menjaga rute admin dari akses tanpa sesi', async () => {
  renderAt('/admin/tools')
  await waitFor(() => {
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })
})
