import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { Box } from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import InterviewCard from './components/InterviewCard'
import { data as initialData } from './data'
import type { InterviewItem } from './types'

// Configuration (you could easily move these into React state if you want them editable via a UI)
const PRESET_START_TIME = dayjs().hour(9).minute(0).second(0) // e.g., 09:00 AM
const TURNAROUND_SECONDS = 60

export default function App() {
  const [interviews, setInterviews] = useState<InterviewItem[]>(
    initialData.map((item, index) => ({
      ...item,
      id: item.id || `interview-${index}`,
    })),
  )

  // Dynamically calculate start times based on the current array order
  const interviewsWithTimes = useMemo(() => {
    // Using reduce avoids reassigning variables, satisfying strict React linters
    const result = interviews.reduce(
      (acc, item) => {
        // 1. Assign the current time to this interview
        const itemWithTime = {
          ...item,
          calculatedStartTime: acc.currentTime.format('HH:mm'), // Formats as 09:00
        }

        // 2. Calculate the start time for the NEXT interview
        const duration = Number.parseInt(item.interviewDuration.toString(), 10)
        const nextTime = acc.currentTime.add(duration + TURNAROUND_SECONDS, 'second')

        // 3. Return the new time and the updated array without mutating anything
        return {
          currentTime: nextTime,
          items: [...acc.items, itemWithTime],
        }
      },
      // Initial state: start with PRESET_START_TIME and an empty array
      { currentTime: PRESET_START_TIME, items: [] as typeof interviews },
    )

    // Extract just the array of items from our result
    return result.items
  }, [interviews]) // Re-runs instantly whenever the drag-and-drop order changes

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(interviews)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setInterviews(items)
  }

  return (
    <Box sx={{ width: '750px' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId='interviews-list'>
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {/* Note: Map over the new dynamically calculated array here! */}
              {interviewsWithTimes.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => <InterviewCard item={item} order={index + 1} provided={provided} />}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}
