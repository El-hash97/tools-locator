import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
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
    <MemoryRouter initialEntries={['/admin/categories']}>
      <App />
    </MemoryRouter>,
  )
}

test('menambah kategori baru', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  await user.type(screen.getByLabelText(/nama kategori/i), 'Alat Kebersihan')
  await user.click(screen.getByRole('button', { name: /tambah/i }))

  await waitFor(() => {
    expect(screen.getByText('Alat Kebersihan')).toBeInTheDocument()
  })
})

test('menolak hapus kategori yang masih dipakai tools', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  const row = screen.getByText('Kunci & Tang').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.getByText(/masih dipakai/i)).toBeInTheDocument()
  })
  expect(screen.getByText('Kunci & Tang')).toBeInTheDocument()
})

// Gap: test di atas memakai kategori yang PASTI ditolak repo (masih dipakai
// tools), jadi tidak membuktikan window.confirm benar-benar menjaga apa pun —
// kalau guard-nya dihapus total, hapus() akan langsung memanggil
// repo.deleteCategory() dan tetap gagal dengan pesan yang sama, test tetap
// lolos. Test ini memakai kategori yang confirm-nya DITOLAK, jadi satu-satunya
// cara test ini lolos adalah kalau guard confirm memang mencegah pemanggilan
// deleteCategory sama sekali.
test('membatalkan hapus saat konfirmasi ditolak', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  const row = screen.getByText('Kunci & Tang').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  expect(screen.queryByText(/masih dipakai/i)).not.toBeInTheDocument()
  expect(screen.getByText('Kunci & Tang')).toBeInTheDocument()
})

// Gap: tidak ada test di brief yang membuktikan hapus SUNGGUH berhasil.
// Keempat kategori seed dipakai tools, jadi tidak ada yang bisa dihapus
// langsung — kategori baru (belum dipakai tools manapun) dipakai di sini agar
// jalur delete yang berhasil benar-benar teruji, bukan cuma jalur ditolak.
test('menghapus kategori baru yang belum dipakai tools', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  await user.type(screen.getByLabelText(/nama kategori/i), 'Alat Kebersihan')
  await user.click(screen.getByRole('button', { name: /tambah/i }))
  await waitFor(() => {
    expect(screen.getByText('Alat Kebersihan')).toBeInTheDocument()
  })

  const row = screen.getByText('Alat Kebersihan').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.queryByText('Alat Kebersihan')).not.toBeInTheDocument()
  })
})

// Gap: brief tidak menguji validasi nama kosong sama sekali, walau
// Categories.tsx punya cabang errornya. Tanpa test ini, menghapus
// validasi tersebut tetap lolos suite.
test('menolak tambah kategori saat nama kosong', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() => expect(screen.getByText('Kunci & Tang')).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: /tambah/i }))

  expect(screen.getByText(/nama kategori wajib diisi/i)).toBeInTheDocument()
})
