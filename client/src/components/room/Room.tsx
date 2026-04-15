import { Droppable } from '@hello-pangea/dnd'
import { Check, Delete, Edit } from '@mui/icons-material'
import { Box, Grid, IconButton, Paper, TextField, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React, { useEffect, useMemo, useState } from 'react'
import type { Room } from '../../types'
import EditSlotModal from '../slot/EditSlotModal'
import SlotComponent from '../slot/Slot'

interface RoomProps {
  room: Room
  highlightedSlots: string[]
  onBoardNeedsRefresh: () => void
}

const RoomComponent: React.FC<RoomProps> = ({ room, highlightedSlots, onBoardNeedsRefresh }) => {
  // Use the room's planned start time, or default to 09:00 AM
  const PRESET_START_TIME = room.plannedStartTime ? dayjs(room.plannedStartTime) : dayjs().hour(9).minute(0).second(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [localName, setLocalName] = useState(room.name)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalName(room.name)
  }, [room.name])

  const saveName = async () => {
    if (localName.trim() && localName !== room.name) {
      try {
        await fetch(`/rooms/${room.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: localName }),
        })
      } catch (error) {
        console.error('Error updating room name', error)
      }
    }
    setEditingName(false)
  }

  const deleteRoom = async () => {
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
    <Paper
      sx={{
        minWidth: '650px',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(0deg, ${room.colour}00 80%, ${room.colour}ff 100%)`,
        backgroundColor: '#f9f9f9',
      }}
    >
      <Grid container>
        <Grid size={9}>
          {editingName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') {
                    setLocalName(room.name)
                    setEditingName(false)
                  }
                }}
                variant='standard'
                sx={{
                  flexGrow: 1,
                  '& .MuiInputBase-input': { m: 0, p: 0, fontSize: '1.4rem', fontWeight: 'bold', lineHeight: '1.1' },
                }}
                autoFocus
              />
              <IconButton size='small' onClick={() => setEditingName(false)} sx={{ ml: 'auto' }}>
                <Check fontSize='small' />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant='h3'>{room.name}</Typography>
              <IconButton size='small' onClick={() => setEditingName(true)} sx={{ ml: 'auto' }}>
                <Edit fontSize='small' />
              </IconButton>
              <IconButton size='small' onClick={() => deleteRoom()}>
                <Delete fontSize='small' />
              </IconButton>
            </Box>
          )}
        </Grid>
        <Grid size={3}>
          <Typography variant='subtitle2'>Planned Start Time</Typography>
          <Typography variant='h4'>{PRESET_START_TIME.format('HH:mm')}</Typography>
        </Grid>
      </Grid>

      <Grid container sx={{ textAlign: 'left', mb: 2 }}>
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
            <Typography variant='subtitle2'>Stream URL</Typography>
            <Typography variant='h6'>{room.zoomLink}</Typography>
          </Grid>
        )}
      </Grid>

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
                onBoardNeedsRefresh={onBoardNeedsRefresh}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
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
    </Paper>
  )
}

export default RoomComponent
