import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test } from 'vitest'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

test('menampilkan nama aplikasi di beranda', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
  await waitFor(() => {
    expect(
      screen.getByRole('heading', { name: 'Tool Locator' }),
    ).toBeInTheDocument()
  })
})
