import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { DataProvider, useData } from './DataProvider'
import { MockRepository } from './mockRepository'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function Probe() {
  const { tools, categories, loading, error } = useData()
  if (loading) return <p>memuat</p>
  if (error) return <p>{`gagal: ${error}`}</p>
  return <p>{`${tools.length} tools, ${categories.length} kategori`}</p>
}

test('memuat tools dan kategori lalu menyediakannya lewat useData', async () => {
  render(
    <DataProvider>
      <Probe />
    </DataProvider>,
  )

  await waitFor(() => {
    expect(screen.getByText(/8 tools, 4 kategori/)).toBeInTheDocument()
  })
})

test('memunculkan pesan saat data gagal dimuat, bukan memuat selamanya', async () => {
  // Tanpa test ini, menghapus setError dari blok catch lolos seluruh suite —
  // dan MP hanya melihat "Memuat…" selamanya tanpa tahu apa yang salah.
  vi.spyOn(MockRepository.prototype, 'getTools').mockRejectedValue(
    new Error('Penyimpanan rusak'),
  )

  render(
    <DataProvider>
      <Probe />
    </DataProvider>,
  )

  await waitFor(() => {
    expect(screen.getByText(/gagal: Penyimpanan rusak/)).toBeInTheDocument()
  })
  expect(screen.queryByText('memuat')).not.toBeInTheDocument()
})

test('useData di luar DataProvider memberi pesan yang jelas', () => {
  // React menuliskan error ke konsol saat render gagal; dibungkam supaya
  // keluaran test tetap terbaca.
  vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => render(<Probe />)).toThrow(
    /useData harus dipakai di dalam <DataProvider>/,
  )
})
