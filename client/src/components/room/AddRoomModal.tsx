import { Circle } from '@mui/icons-material'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { colors } from '../../utils/defaultColors'

interface AddRoomModalProps {
  open: boolean
  onClose: () => void
  dayId: string
}

const AddRoomModal = ({ open, onClose, dayId }: AddRoomModalProps) => {
  const [roomName, setRoomName] = useState('')
  const [roomColour, setRoomColour] = useState('#ffffff')
  const [roomProducer, setRoomProducer] = useState('')
  const [roomTimer, setRoomTimer] = useState('')
  const [roomTechnician, setRoomTechnician] = useState('')
  const [roomStreamURL, setRoomStreamURL] = useState('')
  const [roomZoomLink, setRoomZoomLink] = useState('')

  const handleNewRoom = async (dayId: string, roomName: string, roomColour: string) => {
    fetch(`/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dayId,
        name: roomName,
        colour: roomColour,
        producer: roomProducer,
        timer: roomTimer,
        technician: roomTechnician,
        streamURL: roomStreamURL,
        zoomLink: roomZoomLink,
      }),
    })
    setRoomName('')
    setRoomColour('#ffffff')
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
        <DialogTitle>Add Room</DialogTitle>
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
                label='Colour'
                type='color'
                value={roomColour}
                onChange={(e) => setRoomColour(e.target.value)}
                fullWidth
                margin='dense'
              />
              <Stack direction='row' spacing={1}>
                {colors.map((color) => (
                  <IconButton
                    key={color}
                    sx={{ color: color, border: roomColour === color ? '2px solid' : 'none', p: 0.5 }}
                    onClick={() => setRoomColour(color)}
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
          <Button onClick={onClose}>Cancel</Button>
          <Button variant='contained' onClick={() => handleNewRoom(dayId, roomName, roomColour)}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AddRoomModal
