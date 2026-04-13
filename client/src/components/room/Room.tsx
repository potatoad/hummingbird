import { Droppable } from '@hello-pangea/dnd'
import { Box, Paper, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'
import type { Room } from '../../types'
import SlotComponent from '../slot/Slot'

interface RoomProps {
  room: Room
  highlightedSlots: string[]
}

const RoomComponent: React.FC<RoomProps> = ({ room, highlightedSlots }) => {
  // Use the room's planned start time, or default to 09:00 AM
  const PRESET_START_TIME = room.plannedStartTime ? dayjs(room.plannedStartTime) : dayjs().hour(9).minute(0).second(0)

  // Assuming duration and turnaround in DB are in minutes
  const TURNAROUND_MINUTES = room.turnaround || 0

  const slotsWithTimes = useMemo(() => {
    const result = room.slots.reduce(
      (acc, slot) => {
        // 1. Assign the current time to this slot
        const itemWithTime = {
          ...slot,
          calculatedStartTime: acc.currentTime.format('HH:mm'),
        }

        // 2. Calculate the start time for the NEXT slot
        const duration = slot.duration || 0
        const nextTime = acc.currentTime.add(duration + TURNAROUND_MINUTES, 'minute')

        return {
          currentTime: nextTime,
          items: [...acc.items, itemWithTime],
        }
      },
      { currentTime: PRESET_START_TIME, items: [] as ((typeof room.slots)[0] & { calculatedStartTime?: string })[] },
    )

    return result.items
  }, [room, PRESET_START_TIME, TURNAROUND_MINUTES])

  return (
    <Paper sx={{ width: '750px', p: 2, mr: 2, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
      <Typography variant='h5' sx={{ mb: 2, borderBottom: `4px solid ${room.colour}` }}>
        {room.name}
      </Typography>

      {/* The Droppable area handles the structural spacing */}
      <Droppable droppableId={room.id}>
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ flexGrow: 1, minHeight: '500px' }}>
            {slotsWithTimes.map((slot, index) => (
              <SlotComponent
                key={slot.id}
                slot={slot}
                index={index}
                isHighlighted={highlightedSlots.includes(slot.id)}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  )
}

export default RoomComponent
