import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { DataProvider, useData } from './DataProvider'

beforeEach(() => {
  localStorage.clear()
})

function Probe() {
  const { tools, categories, loading } = useData()
  if (loading) return <p>memuat</p>
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
