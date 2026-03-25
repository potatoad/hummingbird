import React from 'react'
import { Droppable } from '@hello-pangea/dnd'
import { Paper, Typography, Box, List, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField, FormGroup, FormControlLabel, Checkbox} from '@mui/material'
import SlotComponent from '../slot/Slot'

type Slot = { id: string; title: string; duration: number; orderIndex: number; roomId: string }
type Room = { id: string; name: string; slots: Slot[] }

interface RoomProps {
  room: Room
  highlightedSlots: string[]
}

const RoomComponent: React.FC<RoomProps> = ({ room, highlightedSlots }) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  return (
    <Paper key={room.id} sx={{ minWidth: 320, maxWidth: 320, bgcolor: 'grey.100', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 250px)' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
        <Typography variant="h6">{room.name}</Typography>
      </Box>

      <Droppable droppableId={room.id}>
        {(provided) => (
          <List
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{
              p: 2,
              overflowY: 'auto',
              flexGrow: 1,
              transition: 'background-color 0.2s ease',
            }}
          >
            {room.slots
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((slot, index) => {
                const isHighlighted = highlightedSlots.includes(slot.id)
                return (
                  <SlotComponent
                    key={slot.id}
                    slot={slot}
                    index={index}
                    isHighlighted={isHighlighted}
                  />
                )
              })}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
      <Button onClick={handleOpen}>Open modal</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Slot</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Journalist Name"
            type="email"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="duration"
            label="Duration"
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            id="description"
            label="Notes"
            type="text"
            fullWidth
            variant="standard"
          />
          <FormGroup>
            <FormControlLabel control={<Checkbox  />} label='Virtual' />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="subscription-form">
            Add slot
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default RoomComponent