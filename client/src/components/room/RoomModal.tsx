import { Circle } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material'
import { colors } from '@utils/defaultColors'
import type { Room } from '@utils/types'
import { useState } from 'react'

interface AddRoomModalProps {
  open: boolean
  onClose: () => void
  dayId: string
  room?: Room
  numberOfRooms?: number
  handleDeleteRoom: () => void
}

const RoomModal = ({ open, onClose, dayId, room, numberOfRooms, handleDeleteRoom }: AddRoomModalProps) => {
  const [roomName, setRoomName] = useState(room?.name || '')
  const [roomColor, setRoomColor] = useState(room?.color || '#ffffff')
  const [roomProducer, setRoomProducer] = useState(room?.producer || '')
  const [roomTimer, setRoomTimer] = useState(room?.timer || '')
  const [roomTechnician, setRoomTechnician] = useState(room?.technician || '')
  const [roomStreamURL, setRoomStreamURL] = useState(room?.streamURL || '')
  const [roomZoomLink, setRoomZoomLink] = useState(room?.zoomLink || '')

  const handleNewRoom = async (dayId: string, roomName: string, roomColor: string) => {
    if (room && room.id) {
      fetch(`/rooms/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          color: roomColor,
          producer: roomProducer,
          timer: roomTimer,
          technician: roomTechnician,
          streamURL: roomStreamURL,
          zoomLink: roomZoomLink,
        }),
      })
    } else {
      fetch(`/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId,
          name: roomName,
          color: roomColor,
          producer: roomProducer,
          timer: roomTimer,
          technician: roomTechnician,
          streamURL: roomStreamURL,
          zoomLink: roomZoomLink,
          orderIndex: numberOfRooms ? numberOfRooms + 1 : 1,
        }),
      })
    }
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
        <DialogTitle>{room ? 'Edit' : 'Create'} Room</DialogTitle>
        <DialogContent>
          <Stack>
            <TextField
              label='Name'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              fullWidth
              margin='dense'
            />
            <Stack direction='row' alignItems='center' spacing={1} sx={{ mt: 2 }}>
              <TextField
                label='Color'
                type='color'
                value={roomColor}
                onChange={(e) => setRoomColor(e.target.value)}
                fullWidth
                margin='dense'
              />
              <Stack direction='row' spacing={1}>
                {colors.map((color) => (
                  <IconButton
                    key={color}
                    sx={{ color: color, border: roomColor === color ? '2px solid' : 'none', p: 0.5 }}
                    onClick={() => setRoomColor(color)}
                  >
                    <Circle />
                  </IconButton>
                ))}
              </Stack>
            </Stack>
            <TextField
              label='Producer'
              value={roomProducer}
              onChange={(e) => setRoomProducer(e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Timer'
              value={roomTimer}
              onChange={(e) => setRoomTimer(e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Technician'
              value={roomTechnician}
              onChange={(e) => setRoomTechnician(e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Stream URL'
              value={roomStreamURL}
              onChange={(e) => setRoomStreamURL(e.target.value)}
              fullWidth
              margin='dense'
            />
            <TextField
              label='Zoom Link'
              value={roomZoomLink}
              onChange={(e) => setRoomZoomLink(e.target.value)}
              fullWidth
              margin='dense'
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteRoom}>Delete</Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='contained' onClick={() => handleNewRoom(dayId, roomName, roomColor)}>
            {room ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default RoomModal
