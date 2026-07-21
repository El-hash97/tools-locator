import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import App from '@/App'
import { SESSION_KEY } from '@/auth/AuthProvider'

vi.mock('@/lib/image', async () => {
  const actual = await vi.importActual<typeof import('@/lib/image')>('@/lib/image')
  return {
    ...actual,
    compressImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,xxx'),
  }
})

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem(
    'tool-locator:session:v1',
    JSON.stringify({ email: 'admin@tmmin.local' }),
  )
})

function renderAdmin() {
  return render(
    <MemoryRouter initialEntries={['/admin/tools']}>
      <App />
    </MemoryRouter>,
  )
}

test('menampilkan daftar tools yang ada', async () => {
  renderAdmin()
  await waitFor(() => {
    expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument()
  })
})

test('menambah tools baru lewat form', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: /tambah tools/i }))

  await user.type(screen.getByLabelText(/nama tools/i), 'Kuas Coating')
  await user.selectOptions(screen.getByLabelText(/kategori/i), 'cat-pouring')
  await user.selectOptions(screen.getByLabelText(/^area$/i), 'Pouring')
  await user.selectOptions(screen.getByLabelText(/^rak$/i), 'Rak B')
  await user.selectOptions(screen.getByLabelText(/level \/ bin/i), 'loc-pouring-b1')
  await user.clear(screen.getByLabelText(/jumlah/i))
  await user.type(screen.getByLabelText(/jumlah/i), '7')
  await user.click(screen.getByRole('button', { name: /simpan/i }))

  await waitFor(() => {
    expect(screen.getByText('Kuas Coating')).toBeInTheDocument()
  })
})

test('menolak simpan saat nama kosong', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: /tambah tools/i }))
  await user.click(screen.getByRole('button', { name: /simpan/i }))

  expect(screen.getByText(/nama tools wajib diisi/i)).toBeInTheDocument()
})

test('menghapus tools setelah dikonfirmasi', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Sekop Pasir')).toBeInTheDocument())

  const row = screen.getByText('Sekop Pasir').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.queryByText('Sekop Pasir')).not.toBeInTheDocument()
  })
})

test('menampilkan pratinjau QR saat mengubah tools', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  const row = screen.getByText('Kunci Pas 12').closest('li')!
  await user.click(within(row).getByRole('button', { name: /ubah/i }))

  expect(screen.getByTestId('qr-preview')).toBeInTheDocument()
})

// Gap dari Task 13: AuthProvider.signOut() ada sejak Task 13 tapi belum ada
// UI yang memanggilnya, jadi belum pernah teruji sungguhan. AdminLayout di
// task ini menambahkan tombol "Keluar" pertama di aplikasi — pastikan
// mengekliknya benar-benar memanggil signOut dan sesi sungguh terhapus.
test('keluar dari akun menghapus sesi tersimpan', async () => {
  const user = userEvent.setup()
  renderAdmin()
  await waitFor(() => expect(screen.getByText('Kunci Pas 12')).toBeInTheDocument())

  expect(localStorage.getItem(SESSION_KEY)).not.toBeNull()

  await user.click(screen.getByRole('button', { name: /keluar/i }))

  await waitFor(() => {
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
  })
})
