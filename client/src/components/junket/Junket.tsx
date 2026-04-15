import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { Box, Button, FormControl, Tab, Tabs, TextField, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import type { Day, Junket } from '../../types'
import DayComponent from '../day/Day'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface JunketProps {
  junket: Junket
  days: Day[]
  highlightedSlots: string[]
  activeTabIndex: number
  setActiveTabIndex: (index: number) => void
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void
  handleDragEnd: (result: DropResult) => void
  onBoardNeedsRefresh: () => void
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} style={{ height: '100%' }} {...other}>
      {value === index && <Box sx={{ pt: 3, height: '100%' }}>{children}</Box>}
    </div>
  )
}

const JunketComponent: React.FC<JunketProps> = ({
  junket,
  days,
  highlightedSlots,
  activeTabIndex,
  setActiveTabIndex,
  handleTabChange,
  handleDragEnd,
  onBoardNeedsRefresh,
}) => {
  const [newDayDate, setNewDayDate] = useState(dayjs())
  const [greenroomUrl, setGreenroomUrl] = useState('')
  const [greenroomPassword, setGreenroomPassword] = useState('')

  const isDateAlreadyAdded = (date: dayjs.Dayjs | null) => {
    if (!date) return false
    return days.some((day) => dayjs(day.date).isSame(date, 'day'))
  }

  const handleNewDay = async () => {
    try {
      const res = await fetch('/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          junketId: junket.id,
          date: newDayDate.format('YYYY-MM-DD'),
          greenroomUrl,
          greenroomPassword,
        }),
      })
      if (res.ok) {
        setGreenroomUrl('')
        setGreenroomPassword('')
        setNewDayDate(dayjs())
        const insertIndex = days.findIndex((day) => dayjs(day.date).isAfter(newDayDate, 'day'))
        setActiveTabIndex(insertIndex >= 0 ? insertIndex : days.length)
        onBoardNeedsRefresh()
      }
    } catch (error) {
      console.error('Error adding day', error)
    }
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'text.primary', mb: 2, mt: 2 }}>
        <Typography variant='h3'>{junket.name}</Typography>
        <Typography variant='body1'>{junket.description}</Typography>
        <Typography variant='body1'>{junket.location}</Typography>
        <Typography variant='body1'>
          {days.length} day{days.length > 1 ? 's' : ''}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Tabs value={activeTabIndex} onChange={handleTabChange} variant='scrollable'>
          {days.map((day) => (
            <Tab key={day.id} label={new Date(day.date).toLocaleDateString()} />
          ))}
          <Tab key={'addDay'} label='Add Day' />
        </Tabs>

        <DragDropContext onDragEnd={handleDragEnd}>
          {days.map((day, index) => (
            <CustomTabPanel key={day.id} value={activeTabIndex} index={index}>
              <DayComponent day={day} highlightedSlots={highlightedSlots} onBoardNeedsRefresh={onBoardNeedsRefresh} />
            </CustomTabPanel>
          ))}
          <CustomTabPanel key={'addDay'} value={activeTabIndex} index={days.length}>
            <DatePicker
              value={newDayDate}
              shouldDisableDate={isDateAlreadyAdded}
              onAccept={(e) => e && setNewDayDate(e)}
              slotProps={{
                textField: {
                  helperText: isDateAlreadyAdded(newDayDate) && 'This date has already been added.',
                },
              }}
            />
            <TextField
              label='Greenroom URL'
              value={greenroomUrl}
              onChange={(e) => setGreenroomUrl(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
            <TextField
              label='Greenroom Password'
              value={greenroomPassword}
              onChange={(e) => setGreenroomPassword(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Typography variant='body2'>Add a new day to this junket.</Typography>
            </FormControl>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button disabled={isDateAlreadyAdded(newDayDate)} variant='contained' onClick={() => handleNewDay()}>
                Add Day
              </Button>
            </Box>
          </CustomTabPanel>
        </DragDropContext>
      </Box>
    </>
  )
}

export default JunketComponent
