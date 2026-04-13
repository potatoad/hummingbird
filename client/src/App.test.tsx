import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App.old'

// Mock the data to ensure predictable test output
vi.mock('./data', () => ({
  data: [
    { name: 'John Doe', outlet: 'News Corp', interviewDuration: '1800', status: 'COMPLETED' },
    { name: 'Jane Smith', outlet: 'Tech Blog', interviewDuration: '3600', status: 'ON DECK' },
  ],
}))

vi.mock('./contrastingColor', () => vi.fn(() => '#000000'))

describe('App', () => {
  it('renders a list of InterviewCards', () => {
    const { getByText } = render(<App />)

    expect(getByText('John Doe')).toBeInTheDocument()
    expect(getByText('Jane Smith')).toBeInTheDocument()
  })
})
