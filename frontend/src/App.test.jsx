import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import App from './App'

describe('App', () => {
  test('renders the main heading for normal home page view', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: /welcome to huy blog/i }),
    ).toBeInTheDocument()
  })

  test('renders a single h1 heading to preserve semantic structure', () => {
    render(<App />)

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  test('shows frontend and backend technology text for user context', () => {
    render(<App />)

    expect(
      screen.getByText(/frontend:\s*react\s*\|\s*backend:\s*fastapi/i),
    ).toBeInTheDocument()
  })

  test('does not render an unexpected error message in default state', () => {
    render(<App />)

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
  })
})
