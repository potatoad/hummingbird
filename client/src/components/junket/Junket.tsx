import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { Box, Tab, Tabs } from '@mui/material'
import React from 'react'
import DayComponent from '../day/Day'

type Slot = { id: string; title: string; duration: number; orderIndex: number; roomId: string }
type Room = { id: string; name: string; slots: Slot[] }
type Day = { id: string; date: string; rooms: Room[] }
type Junket = { id: string; name: string; days: Day[] }

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} style={{ height: '100%' }} {...other}>
      {value === index && <Box sx={{ pt: 3, height: '100%' }}>{children}</Box>}
    </div>
  )
}

interface JunketProps {
  junket: Junket
  days: Day[]
  highlightedSlots: string[]
  activeTabIndex: number
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void
  handleDragEnd: (result: DropResult) => void
}

const JunketComponent: React.FC<JunketProps> = ({
  junket,
  days,
  highlightedSlots,
  activeTabIndex,
  handleTabChange,
  handleDragEnd,
}) => {
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Tabs value={activeTabIndex} onChange={handleTabChange} variant='scrollable'>
        {days.map((day) => (
          <Tab key={day.id} label={new Date(day.date).toLocaleDateString()} />
        ))}
      </Tabs>

      <DragDropContext onDragEnd={handleDragEnd}>
        {days.map((day, index) => (
          <CustomTabPanel key={day.id} value={activeTabIndex} index={index}>
            <DayComponent day={day} highlightedSlots={highlightedSlots} />
          </CustomTabPanel>
        ))}
      </DragDropContext>
    </Box>
  )
}

export default JunketComponent
