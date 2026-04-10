import { Draggable } from '@hello-pangea/dnd'
import EditIcon from '@mui/icons-material/Edit'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItem,
  TextField,
  Typography,
} from '@mui/material'

import React from 'react'

type Slot = {
  id: string
  title: string
  colour: string
  duration: number
  orderIndex: number
  roomId: string
  isVirtual?: boolean
  isNote?: boolean
  slotType?: string
  description?: string
  status?: string
}

interface SlotProps {
  slot: Slot
  index: number
  isHighlighted: boolean
}

const handleUpdateSlot = async (slot: Slot) => {
  try {
    const response = await fetch('http://localhost:3000/slots/' + slot.id, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slot),
    })

    if (!response.ok) {
      throw new Error('Failed to create slot')
    }
  } catch (error) {
    console.error('Error updating slot:', error)
    // Optionally, show an error message to the user
  }
}

const SlotComponent: React.FC<SlotProps> = ({ slot, index, isHighlighted }) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [duration, setDuration] = React.useState(slot.duration)

  const slotInterview = (slot: Slot) => {
    return (
      <Box sx={{ backgroundColor: slot.isVirtual ? '#fff2cc' : slot.colour }}>
        <Grid container spacing={2} sx={{ pr: 2, pl: 2 }}>
          <Grid size={10}>
            <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
              {slot.title}
            </Typography>
          </Grid>
          <Grid size={2}>
            <Typography variant='body2' color='text.secondary'>
              {slot.duration / 60} mins
            </Typography>
          </Grid>
        </Grid>

        {/* <FormControl>
        <InputLabel>Virtual</InputLabel>
        <Checkbox
          checked={slot.isVirtual}
          onChange={(e) => {
            handleUpdateSlot({ ...slot, isVirtual: e.target.checked })
            console.log(slot)
            console.log(e.target.checked)
          }}
        />
      </FormControl>
      <FormControl>
        <InputLabel>Status</InputLabel>
        <Select
          labelId='status-select-label'
          id='status-select'
          value={slot.status}
          label='Status'
          onChange={(e) => {
            handleUpdateSlot({ ...slot, status: e.target.value })
          }}
        >
          <MenuItem value='BLANK'>
            <em>none</em>
          </MenuItem>
          <MenuItem value='ARRIVED'>Checked-in</MenuItem>
          <MenuItem value='IN_PROGRESS'>On deck</MenuItem>
          <MenuItem value='INTERVIEW'>In interview</MenuItem>
          <MenuItem value='COMPLETED'>Completed</MenuItem>
          <MenuItem value='CANCELLED'>Cancelled</MenuItem>
        </Select>
      </FormControl> */}
      </Box>
    )
  }

  const slotTalent = (slot: Slot) => {
    return (
      <Box sx={{ backgroundColor: slot.isVirtual ? '#fff2cc' : slot.colour }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {slot.title}
        </Typography>
      </Box>
    )
  }

  const slotNote = (slot: Slot) => {
    return (
      <Box sx={{ backgroundColor: slot.colour }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {slot.title}
        </Typography>
      </Box>
    )
  }

  const slotBuffer = (slot: Slot) => {
    return (
      <Box sx={{ backgroundColor: slot.colour }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {slot.title}
        </Typography>
      </Box>
    )
  }

  const slotBreak = (slot: Slot) => {
    return (
      <Box sx={{ backgroundColor: 'lightGrey' }}>
        <Typography variant='h6' sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {slot.title} - {slot.duration / 60} mins
        </Typography>
      </Box>
    )
  }

  const slotBox = (slot: Slot) => {
    switch (slot.slotType) {
      case 'INTERVIEW':
        return slotInterview(slot)
      case 'TALENT':
        return slotTalent(slot)
      case 'NOTE':
        return slotNote(slot)
      case 'BUFFER':
        return slotBuffer(slot)
      case 'BREAK':
        return slotBreak(slot)
      default:
        return null
    }
  }

  return (
    <>
      <Draggable key={slot.id} draggableId={slot.id} index={index}>
        {(provided, snapshot) => (
          <ListItem
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            disablePadding
            sx={{ mb: '2px', ...provided.draggableProps.style }}
          >
            <Box
              className={`${isHighlighted ? 'item-dropped-glow' : ''}`}
              sx={{
                width: '100%',
                boxShadow: snapshot.isDragging ? 2 : 0,
              }}
            >
              <Box>{slotBox(slot)}</Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconButton size='small' onClick={handleOpen}>
                  <EditIcon fontSize='small' />
                </IconButton>
              </Box>
            </Box>
          </ListItem>
        )}
      </Draggable>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
          handleClose()
        }}
      >
        <DialogTitle>Edit Slot</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label='Title'
              value={slot.title}
              onChange={(e) => {
                handleUpdateSlot({ ...slot, title: e.target.value })
              }}
            />
            Colour: {slot.colour}
            <br />
            Duration: {slot.duration}
            <br />
            Order Index: {slot.orderIndex}
            <br />
            Room ID: {slot.roomId}
            <br />
            Is Virtual: {slot.isVirtual ? 'Yes' : 'No'}
            <br />
            Is Note: {slot.isNote ? 'Yes' : 'No'}
            <br />
            <Button onClick={handleClose}>Close</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SlotComponent
