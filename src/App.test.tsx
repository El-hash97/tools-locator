import { render, screen } from '@testing-library/react'
import App from './App'

test('menampilkan nama aplikasi', () => {
  render(<App />)
  expect(screen.getByText('Tool Locator')).toBeInTheDocument()
})
