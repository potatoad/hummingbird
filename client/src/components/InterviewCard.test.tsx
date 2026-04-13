import type { DraggableProvided } from '@hello-pangea/dnd'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import InterviewCard from './InterviewCard'

// Mock the external contrastingColor function
vi.mock('../contrastingColor', () => ({
  default: vi.fn(() => '#000000'),
}))

const mockProvided: DraggableProvided = {
  innerRef: vi.fn(),
  draggableProps: {
    'data-rbd-draggable-context-id': '1',
    'data-rbd-draggable-id': '1',
  },
  dragHandleProps: {
    'data-rbd-drag-handle-draggable-id': '1',
    'data-rbd-drag-handle-context-id': '1',
    role: 'button',
    tabIndex: 0,
    draggable: false,
    onDragStart: vi.fn(),
  },
}

describe('InterviewCard', () => {
  const mockItem = {
    id: '123',
    name: 'Jane Doe',
    outlet: 'Tech Daily',
    territory: 'UK',
    notes: 'Ask about new features',
    interviewDuration: '3600',
    status: 'ON DECK',
    virtual: false,
    break: false,
  }

  it('renders interview details correctly', () => {
    render(<InterviewCard item={mockItem} order={1} provided={mockProvided} />)

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Tech Daily')).toBeInTheDocument()
    expect(screen.getByText('UK')).toBeInTheDocument()
    expect(screen.getByText('Ask about new features')).toBeInTheDocument()
    expect(screen.getByText('60 mins')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('applies strikethrough styling when status is CANCELLED', () => {
    const cancelledItem = { ...mockItem, status: 'CANCELLED' }
    render(<InterviewCard item={cancelledItem} order={2} provided={mockProvided} />)

    const nameElement = screen.getByText('Jane Doe')
    expect(nameElement).toHaveStyle('text-decoration: line-through')
  })
})
