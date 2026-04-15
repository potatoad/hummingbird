import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'
import type { Junket } from '../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface AddModalProps {
  open: boolean
  onClose: () => void
  junkets: Junket[]
  onSuccess: () => void
}

export default function AddModal({ open, onClose, junkets, onSuccess }: AddModalProps) {
  const [tabValue, setTabValue] = useState(0)

  // Junket form
  const [junketName, setJunketName] = useState('')
  const [junketDesc, setJunketDesc] = useState('')
  const [junketLoc, setJunketLoc] = useState('')

  // Day form
  const [dayJunketId, setDayJunketId] = useState('')
  const [dayDate, setDayDate] = useState<Dayjs | null>(dayjs())

  // Room form
  const [roomJunketId, setRoomJunketId] = useState('')
  const [roomDayId, setRoomDayId] = useState('')
  const [roomName, setRoomName] = useState('')
  const [roomColour, setRoomColour] = useState('#ffffff')

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddJunket = async () => {
    try {
      const res = await fetch('/junkets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: junketName,
          description: junketDesc,
          location: junketLoc,
        }),
      })
      if (res.ok) {
        setJunketName('')
        setJunketDesc('')
        setJunketLoc('')
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error adding junket', error)
    }
  }

  const handleAddDay = async () => {
    try {
      const res = await fetch('/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          junketId: dayJunketId,
          date: dayDate?.format('YYYY-MM-DD'),
        }),
      })
      if (res.ok) {
        setDayJunketId('')
        setDayDate(dayjs())
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error adding day', error)
    }
  }

  const handleAddRoom = async () => {
    try {
      const res = await fetch('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: roomDayId,
          name: roomName,
          colour: roomColour,
        }),
      })
      if (res.ok) {
        setRoomJunketId('')
        setRoomDayId('')
        setRoomName('')
        setRoomColour('#ffffff')
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error adding room', error)
    }
  }

  const selectedJunketForRoom = junkets.find((j) => j.id === roomJunketId)
  const availableDays = selectedJunketForRoom?.days || []

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Add New Entity</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label='add entity tabs'>
            <Tab label='Junket' />
            <Tab label='Day' />
            <Tab label='Room' />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <TextField
            label='Name'
            value={junketName}
            onChange={(e) => setJunketName(e.target.value)}
            fullWidth
            margin='dense'
          />
          <TextField
            label='Description'
            value={junketDesc}
            onChange={(e) => setJunketDesc(e.target.value)}
            fullWidth
            margin='dense'
          />
          <TextField
            label='Location'
            value={junketLoc}
            onChange={(e) => setJunketLoc(e.target.value)}
            fullWidth
            margin='dense'
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <TextField
            select
            label='Junket'
            value={dayJunketId}
            onChange={(e) => setDayJunketId(e.target.value)}
            fullWidth
            margin='dense'
            SelectProps={{ native: true }}
          >
            <option value=''></option>
            {junkets.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </TextField>
          <DatePicker
            label='Date'
            value={dayDate}
            onChange={setDayDate}
            slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <TextField
            select
            label='Junket'
            value={roomJunketId}
            onChange={(e) => {
              setRoomJunketId(e.target.value)
              setRoomDayId('')
            }}
            fullWidth
            margin='dense'
            SelectProps={{ native: true }}
          >
            <option value=''></option>
            {junkets.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label='Day'
            value={roomDayId}
            onChange={(e) => setRoomDayId(e.target.value)}
            fullWidth
            margin='dense'
            SelectProps={{ native: true }}
            disabled={!roomJunketId}
          >
            <option value=''></option>
            {availableDays.map((d) => (
              <option key={d.id} value={d.id}>
                {dayjs(d.date).format('YYYY-MM-DD')}
              </option>
            ))}
          </TextField>
          <TextField
            label='Name'
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            fullWidth
            margin='dense'
          />
          <TextField
            label='Colour'
            type='color'
            value={roomColour}
            onChange={(e) => setRoomColour(e.target.value)}
            fullWidth
            margin='dense'
          />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={tabValue === 0 ? handleAddJunket : tabValue === 1 ? handleAddDay : handleAddRoom}
          variant='contained'
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
