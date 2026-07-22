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
    <MemoryRouter initialEntries={['/admin/locations']}>
      <App />
    </MemoryRouter>,
  )
}

test('menambah lokasi baru', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  await user.type(screen.getByLabelText(/^area$/i), 'Finishing')
  await user.type(screen.getByLabelText(/^rak$/i), 'Rak D')
  await user.type(screen.getByLabelText(/level \/ bin/i), 'Level 1')
  await user.click(screen.getByRole('button', { name: /tambah lokasi/i }))

  await waitFor(() => {
    expect(screen.getByText('Finishing · Rak D · Level 1')).toBeInTheDocument()
  })
})

test('menolak simpan saat ada bagian lokasi yang kosong', async () => {
  const user = userEvent.setup()
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  await user.type(screen.getByLabelText(/^area$/i), 'Finishing')
  await user.click(screen.getByRole('button', { name: /tambah lokasi/i }))

  expect(
    screen.getByText(/area, rak, dan level \/ bin wajib diisi/i),
  ).toBeInTheDocument()
})

test('menolak hapus lokasi yang masih dipakai tools', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  const row = screen.getByText('Melting · Rak A · Level 1').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.getByText(/masih dipakai/i)).toBeInTheDocument()
  })
})

// Gap (shape identical to Task 15/Categories): test di atas memakai lokasi
// yang PASTI ditolak repo (masih dipakai tools), jadi tidak membuktikan
// window.confirm benar-benar menjaga apa pun — kalau guard-nya dihapus total,
// hapus() akan langsung memanggil repo.deleteLocation() dan tetap gagal
// dengan pesan yang sama, test tetap lolos. Test ini memakai lokasi yang
// confirm-nya DITOLAK, jadi satu-satunya cara test ini lolos adalah kalau
// guard confirm memang mencegah pemanggilan deleteLocation sama sekali.
test('membatalkan hapus saat konfirmasi ditolak', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  const row = screen.getByText('Melting · Rak A · Level 1').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  expect(screen.queryByText(/masih dipakai/i)).not.toBeInTheDocument()
  expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument()
})

// Gap (shape identical to Task 15/Categories): tidak ada test di brief yang
// membuktikan hapus SUNGGUH berhasil. Kelima lokasi seed dipakai tools, jadi
// tidak ada yang bisa dihapus langsung — lokasi baru (belum dipakai tools
// manapun) dipakai di sini agar jalur delete yang berhasil benar-benar
// teruji, bukan cuma jalur ditolak.
test('menghapus lokasi baru yang belum dipakai tools', async () => {
  const user = userEvent.setup()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  renderPage()
  await waitFor(() =>
    expect(screen.getByText('Melting · Rak A · Level 1')).toBeInTheDocument(),
  )

  await user.type(screen.getByLabelText(/^area$/i), 'Finishing')
  await user.type(screen.getByLabelText(/^rak$/i), 'Rak D')
  await user.type(screen.getByLabelText(/level \/ bin/i), 'Level 1')
  await user.click(screen.getByRole('button', { name: /tambah lokasi/i }))
  await waitFor(() => {
    expect(screen.getByText('Finishing · Rak D · Level 1')).toBeInTheDocument()
  })

  const row = screen.getByText('Finishing · Rak D · Level 1').closest('li')!
  await user.click(within(row).getByRole('button', { name: /hapus/i }))

  await waitFor(() => {
    expect(screen.queryByText('Finishing · Rak D · Level 1')).not.toBeInTheDocument()
  })
})
