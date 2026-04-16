import { DragHandle, EditSquare } from '@mui/icons-material'
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import { contrastingColor, contrastingColorBlendMode } from '@utils/contrastingColor'
import dayjs from 'dayjs'
import React, { useMemo, useState } from 'react'
import type { Room } from '../../utils/types'
import SlotComponent from '../slot/Slot'
import EditSlotModal from '../slot/SlotModal'
import RoomModal from './RoomModal'

interface RoomProps {
  room: Room
  index: number
  highlightedSlots: string[]
  onBoardNeedsRefresh: () => void
}

const RoomComponent: React.FC<RoomProps> = ({ room, index, highlightedSlots, onBoardNeedsRefresh }) => {
  // Use the room's planned start time, or default to 09:00 AM
  const PRESET_START_TIME = room.plannedStartTime ? dayjs(room.plannedStartTime) : dayjs().hour(9).minute(0).second(0)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDeleteRoom = async () => {
    try {
      await fetch(`/rooms/${room.id}`, {
        method: 'DELETE',
      })
      onBoardNeedsRefresh()
    } catch (error) {
      console.error('Error deleting room', error)
    }
  }

  // Assuming duration and turnaround in DB are in minutes
  const TURNAROUND_SECONDS = room.turnaround || 0

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
        const nextTime = acc.currentTime.add(duration, 'second').add(TURNAROUND_SECONDS, 'second')

        return {
          currentTime: nextTime,
          items: [...acc.items, itemWithTime],
        }
      },
      { currentTime: PRESET_START_TIME, items: [] as ((typeof room.slots)[0] & { calculatedStartTime?: string })[] },
    )

    return result.items
  }, [room, PRESET_START_TIME, TURNAROUND_SECONDS])

  return (
    <Paper
      id={`room-${index}`}
      sx={{
        minWidth: '650px',
        p: 1,
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        background: `linear-gradient(0deg, ${room.color}44 80%, ${room.color}ff 100%)`,
        backgroundColor: '#f9f9f9',
      }}
    >
      <IconButton
        aria-label='edit slot'
        onClick={() => setIsModalOpen(true)}
        sx={{
          p: 0,
          position: 'absolute',
          top: '5px',
          right: '5px',
          color: contrastingColor(room.color),
          mixBlendMode: contrastingColorBlendMode(room.color) || '',
        }}
      >
        <EditSquare fontSize='small' />
      </IconButton>

      <IconButton
        aria-label='drag slot'
        sx={{
          p: 0,
          position: 'absolute',
          top: '35px',
          right: '5px',
          color: contrastingColor(room.color),
          mixBlendMode: contrastingColorBlendMode ? contrastingColorBlendMode(room.color) : 'overlay',
          cursor: 'grab',
        }}
      >
        <DragHandle fontSize='small' />
      </IconButton>
      <Grid container sx={{ color: contrastingColor(room.color) }}>
        <Grid size={9}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant='h3'>{room.name}</Typography>
          </Box>
        </Grid>
        <Grid size={3}>
          <Typography variant='subtitle2'>Planned Start Time</Typography>
          <Typography variant='h4'>{PRESET_START_TIME.format('HH:mm')}</Typography>
        </Grid>
      </Grid>

      <Grid container sx={{ textAlign: 'left', mb: 2, color: contrastingColor(room.color) }}>
        {room.producer && (
          <Grid size={2}>
            <Typography variant='subtitle2'>Producer</Typography>
            <Typography variant='h6'>{room.producer}</Typography>
          </Grid>
        )}
        {room.timer && (
          <Grid size={2}>
            <Typography variant='subtitle2'>Timer</Typography>
            <Typography variant='h6'>{room.timer}</Typography>
          </Grid>
        )}
        {room.technician && (
          <Grid size={2}>
            <Typography variant='subtitle2'>Technician</Typography>
            <Typography variant='h6'>{room.technician}</Typography>
          </Grid>
        )}
        {room.streamURL && (
          <Grid size={6}>
            <Typography variant='subtitle2'>Stream URL</Typography>
            <Typography variant='h6'>{room.streamURL}</Typography>
          </Grid>
        )}
        {room.zoomLink && (
          <Grid size={6}>
            <Typography variant='subtitle2'>Zoom Meeting URL</Typography>
            <Typography variant='h6'>
              <a href={room.zoomLink} target='_blank' rel='noopener noreferrer'>
                {room.zoomLink}
              </a>
            </Typography>
          </Grid>
        )}
      </Grid>

      <Box sx={{ flexGrow: 1, minHeight: '500px' }}>
        {slotsWithTimes.map((slot, index) => (
          <SlotComponent
            key={slot.id}
            slot={slot}
            index={index}
            isHighlighted={highlightedSlots.includes(slot.id)}
            onBoardNeedsRefresh={onBoardNeedsRefresh}
          />
        ))}
      </Box>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography
          variant='button'
          sx={{
            cursor: 'pointer',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
          onClick={() => {
            setIsModalOpen(true)
          }}
        >
          + Add Slot
        </Typography>
        <EditSlotModal
          open={isModalOpen}
          slot={{
            name: '',
            outlet: '',
            duration: 0,
            isVirtual: false,
            isBreak: false,
            roomId: room.id,
          }}
          onClose={() => {
            setIsModalOpen(false)
          }}
          onSave={async (updatedFields) => {
            const maxOrderIndex = room.slots.length > 0 ? Math.max(...room.slots.map((s) => s.orderIndex || 0)) : 0
            const newSlotData = {
              ...updatedFields,
              orderIndex: maxOrderIndex + 1,
            }
            try {
              const response = await fetch('/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSlotData),
              })
              if (response.ok) {
                setIsModalOpen(false)
                onBoardNeedsRefresh()
              } else {
                console.error('Failed to create slot')
              }
            } catch (error) {
              console.error('Error creating slot', error)
            }
          }}
        />
      </Box>
      <RoomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dayId={room.dayId}
        room={room}
        handleDeleteRoom={handleDeleteRoom}
      />
    </Paper>
  )
}

export default RoomComponent
