import { Box, Button, Link, Paper, Typography } from '@mui/material'
import React, { useState } from 'react'
import type { Day } from '../../types'
import AddRoomModal from '../room/AddRoomModal'
import RoomComponent from '../room/Room'

interface DayProps {
  day: Day
  highlightedSlots: string[]
  onBoardNeedsRefresh: () => void
}

const DayComponent: React.FC<DayProps> = ({ day, highlightedSlots, onBoardNeedsRefresh }) => {
  const [open, setOpen] = useState(false)
  const onClose = () => {
    setOpen(false)
  }
  return (
    <>
      <Button
        variant='contained'
        color='error'
        sx={{ mb: 2 }}
        onClick={() => {
          fetch(`/days/${day.id}`, {
            method: 'DELETE',
          })
          onBoardNeedsRefresh()
        }}
      >
        Delete Day
      </Button>
      <Button
        variant='contained'
        color='success'
        onClick={() => {
          setOpen(true)
        }}
      >
        Add Room
      </Button>
      {day.greenroomUrl && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Typography variant='h3'>Greenroom</Typography>
          <Typography variant='body2'>
            <Link href={day.greenroomUrl}>{day.greenroomUrl}</Link>
          </Typography>
          <Typography variant='body2'>Password: {day.greenroomPassword}</Typography>
        </Paper>
      )}
      <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 2, height: '100%' }}>
        {day.rooms.map((room) => (
          <RoomComponent
            key={room.id}
            room={room}
            highlightedSlots={highlightedSlots}
            onBoardNeedsRefresh={onBoardNeedsRefresh}
          />
        ))}
      </Box>
      <AddRoomModal open={open} onClose={onClose} dayId={day.id} />
    </>
  )
}

export default DayComponent
