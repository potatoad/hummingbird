import { Droppable } from '@hello-pangea/dnd'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  List,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import React from 'react'

import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Tab from '@mui/material/Tab'
import { createTheme } from '@mui/material/styles'
import { MuiColorInput } from 'mui-color-input'

import SlotComponent from '../slot/Slot'

type Slot = {
  id: string
  title: string
  duration: number
  orderIndex: number
  roomId: string
  isVirtual?: boolean
  isNote?: boolean
  slotType?: string
  description?: string
  colour: string
}
type Room = { id: string; colour: string; name: string; slots: Slot[] }

interface RoomProps {
  room: Room
  highlightedSlots: string[]
}

const theme = createTheme({})

const RoomComponent: React.FC<RoomProps> = ({ room, highlightedSlots }) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    // Clear form fields when closing
    setJournalistName('')
    setInterviewDuration(0)
    setDescription('')
    setDescription('')
    setIsVirtual(false)
    setTalentName('')
    setNoteContent('')
    setBufferText('')
    setBufferDuration(0)
    setBreakText('')
    setBreakDuration(0)
    setValue('1') // Reset to default tab
    setColour('#ffffff')
  }

  const [value, setValue] = React.useState('1')
  const [journalistName, setJournalistName] = React.useState('')
  const [interviewDuration, setInterviewDuration] = React.useState(0)
  const [description, setDescription] = React.useState('')

  const [isVirtual, setIsVirtual] = React.useState(false)

  const [talentName, setTalentName] = React.useState('')

  const [noteContent, setNoteContent] = React.useState('')

  const [bufferText, setBufferText] = React.useState('')
  const [bufferDuration, setBufferDuration] = React.useState(0)

  const [breakText, setBreakText] = React.useState('')
  const [breakDuration, setBreakDuration] = React.useState(0)

  const [colour, setColour] = React.useState('#ffffff')

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  const handleNewSlot = async () => {
    let slotData: Partial<Slot> = { roomId: room.id, orderIndex: room.slots.length }

    switch (value) {
      case '1': // Interview
        slotData = {
          ...slotData,
          title: journalistName,
          duration: interviewDuration,
          description: description,
          isVirtual: isVirtual,
          slotType: 'INTERVIEW',
        }
        break
      case '2': // Talent Name
        slotData = {
          ...slotData,
          title: talentName,
          slotType: 'TALENT',
          colour: colour,
        }
        break
      case '3': // Note
        slotData = {
          ...slotData,
          title: noteContent,
          isNote: true,
          slotType: 'NOTE',
        }
        break
      case '4': // Buffer
        slotData = {
          ...slotData,
          title: bufferText,
          duration: bufferDuration,
          slotType: 'BUFFER',
        }
        break
      case '5': // Break
        slotData = {
          ...slotData,
          title: breakText,
          duration: breakDuration,
          slotType: 'BREAK',
        }
        break
      default:
        console.error('Unknown tab value:', value)
        return
    }

    try {
      const response = await fetch('http://localhost:3000/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      })

      if (!response.ok) {
        throw new Error('Failed to create slot')
      }

      handleClose()
      // You might want to trigger a re-fetch of room data here
      // to update the UI with the new slot.
    } catch (error) {
      console.error('Error creating slot:', error)
      // Optionally, show an error message to the user
    }
  }

  return (
    <Paper
      elevation={2}
      key={room.id}
      sx={{
        minWidth: 600,
        maxWidth: 600,
        bgcolor: 'grey.900',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 250px)',
        maxHeight: 'fit-content',
        overflowY: 'auto',
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: room.colour,
          color: theme.palette.getContrastText(room.colour),
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <Typography variant='h6'>
          <strong>{room.name}</strong>
        </Typography>
      </Box>

      <Droppable droppableId={room.id}>
        {(provided) => (
          <List
            {...provided.droppableProps}
            ref={provided.innerRef}
            sx={{
              overflowY: 'auto',
              flexGrow: 1,
              transition: 'background-color 0.2s ease',
            }}
          >
            {room.slots
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((slot, index) => {
                const isHighlighted = highlightedSlots.includes(slot.id)
                return <SlotComponent key={slot.id} slot={slot} index={index} isHighlighted={isHighlighted} />
              })}
            {provided.placeholder}
          </List>
        )}
      </Droppable>
      <Button onClick={handleOpen}>Add slot</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Slot</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>Select slot type:</DialogContentText> */}
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChangeTab} aria-label='new slot tabs'>
                <Tab label='Interview' value='1' />
                <Tab label='Talent Name' value='2' />
                <Tab label='Note' value='3' />
                <Tab label='Buffer' value='4' />
                <Tab label='Break' value='5' />
              </TabList>
            </Box>
            <TabPanel value='1'>
              <TextField
                autoFocus
                margin='dense'
                id='journalistName'
                label='Journalist Name'
                fullWidth
                variant='standard'
                value={journalistName}
                onChange={(e) => setJournalistName(e.target.value)}
              />
              <TextField
                margin='dense'
                id='duration'
                label='Duration'
                type='number'
                fullWidth
                variant='standard'
                value={interviewDuration}
                onChange={(e) => setInterviewDuration(Number(e.target.value))}
              />
              <TextField
                margin='dense'
                id='description'
                label='Notes'
                type='text'
                fullWidth
                variant='standard'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox checked={isVirtual} onChange={(e) => setIsVirtual(e.target.checked)} />}
                  label='Virtual'
                />
              </FormGroup>
            </TabPanel>
            <TabPanel value='2'>
              <TextField
                autoFocus
                margin='dense'
                id='talentName'
                label='Talent Name'
                fullWidth
                variant='standard'
                value={talentName}
                onChange={(e) => setTalentName(e.target.value)}
              />
              <MuiColorInput format='hex' value={colour} onChange={(newColor) => setColour(newColor)} />
            </TabPanel>
            <TabPanel value='3'>
              <TextField
                autoFocus
                margin='dense'
                id='note'
                label='Notes'
                fullWidth
                variant='standard'
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
            </TabPanel>
            <TabPanel value='4'>
              <TextField
                autoFocus
                margin='dense'
                id='bufferText'
                label='Buffer Name'
                fullWidth
                variant='standard'
                value={bufferText}
                onChange={(e) => setBufferText(e.target.value)}
              />
              <TextField
                margin='dense'
                id='duration'
                label='Duration'
                type='number'
                fullWidth
                variant='standard'
                value={bufferDuration}
                onChange={(e) => setBufferDuration(Number(e.target.value))}
              />
            </TabPanel>
            <TabPanel value='5'>
              <TextField
                autoFocus
                margin='dense'
                id='breakText'
                label='Break Name'
                fullWidth
                variant='standard'
                value={breakText}
                onChange={(e) => setBreakText(e.target.value)}
              />
              <TextField
                margin='dense'
                id='duration'
                label='Duration'
                type='number'
                fullWidth
                variant='standard'
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
              />
            </TabPanel>
          </TabContext>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleNewSlot}>Add slot</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default RoomComponent
