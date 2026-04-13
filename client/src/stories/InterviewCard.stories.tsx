import type { DraggableProvided } from '@hello-pangea/dnd'
import { Box } from '@mui/material'
import type { Meta, StoryObj } from '@storybook/react'
import InterviewCard from '../components/InterviewCard'

const mockProvided: DraggableProvided = {
  innerRef: () => {},
  draggableProps: {
    'data-rfd-draggable-context-id': '1',
    'data-rfd-draggable-id': '1',
  },
  dragHandleProps: {
    'data-rfd-drag-handle-draggable-id': '1',
    'data-rfd-drag-handle-context-id': '1',
    role: 'button',
    'aria-describedby': '',
    tabIndex: 0,
    draggable: false,
    onDragStart: () => {},
  },
}

const meta: Meta<typeof InterviewCard> = {
  title: 'Components/InterviewCard',
  component: InterviewCard,
  decorators: [
    (Story) => (
      <Box sx={{ width: '750px', p: 2, bgcolor: '#f5f5f5' }}>
        <Story />
      </Box>
    ),
  ],
  // Pass the mock provided prop globally to all stories
  args: {
    provided: mockProvided,
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof InterviewCard>

const baseItem = {
  id: 'story-item-1',
  name: 'Clark Kent',
  outlet: 'Daily Planet',
  territory: 'US',
  notes: 'Discuss recent sightings in Metropolis.',
  interviewDuration: '1800',
  virtual: false,
  isBreak: false,
}

export const OnDeck: Story = {
  args: {
    order: 1,
    item: { ...baseItem, status: 'ON DECK' },
  },
}

export const InInterview: Story = {
  args: {
    order: 2,
    item: { ...baseItem, status: 'IN INTERVIEW' },
  },
}

export const Cancelled: Story = {
  args: {
    order: 4,
    item: { ...baseItem, status: 'CANCELLED' },
  },
}

export const VirtualInterview: Story = {
  args: {
    order: 5,
    item: { ...baseItem, status: 'ON DECK', virtual: true },
  },
}

export const Break: Story = {
  args: {
    order: 6,
    item: { ...baseItem, status: 'ON DECK', isBreak: true, breakText: 'Break' },
  },
}
