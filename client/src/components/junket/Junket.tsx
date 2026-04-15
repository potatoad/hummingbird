import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { Edit } from '@mui/icons-material'
import { Box, Button, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import type { Day, Junket } from '../../utils/types'
import DayComponent from '../day/Day'
import DayModal from '../day/DayModal'

interface DayPanelProps {
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
  handleDragEnd: (result: DropResult) => void
  onBoardNeedsRefresh: () => void
}

function DayPanel(props: DayPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} style={{ height: '100%' }} {...other}>
      {value === index && <Box sx={{ pt: 1, height: '100%' }}>{children}</Box>}
    </div>
  )
}

const JunketComponent: React.FC<JunketProps> = ({
  junket,
  days,
  highlightedSlots,
  activeTabIndex,
  setActiveTabIndex,
  handleDragEnd,
  onBoardNeedsRefresh,
}) => {
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<Day | null>(null)

  const isDateAlreadyAdded = (date: dayjs.Dayjs | null, currentDayId?: string) => {
    if (!date) return false
    return days.some((day) => day.id !== currentDayId && dayjs(day.date).isSame(date, 'day'))
  }

  const getInsertIndex = (targetDate: dayjs.Dayjs) => {
    const filteredDays = days.filter((day) => day.id !== editingDay?.id)
    const insertIndex = filteredDays.findIndex((day) => dayjs(day.date).isAfter(targetDate, 'day'))
    return insertIndex >= 0 ? insertIndex : filteredDays.length
  }

  const handleAddDay = async (fields: { date: string; greenroomUrl: string; greenroomPassword: string }) => {
    try {
      const res = await fetch('/days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          junketId: junket.id,
          date: fields.date,
          greenroomUrl: fields.greenroomUrl,
          greenroomPassword: fields.greenroomPassword,
        }),
      })
      if (res.ok) {
        onBoardNeedsRefresh()
        setActiveTabIndex(getInsertIndex(dayjs(fields.date)))
        setEditingDay(null)
        setIsDayModalOpen(false)
      }
    } catch (error) {
      console.error('Error adding day', error)
    }
  }

  const handleEditDay = async (
    dayId: string,
    fields: { date: string; greenroomUrl: string; greenroomPassword: string },
  ) => {
    try {
      const res = await fetch(`/days/${dayId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: fields.date,
          greenroomUrl: fields.greenroomUrl,
          greenroomPassword: fields.greenroomPassword,
        }),
      })
      if (res.ok) {
        onBoardNeedsRefresh()
        setActiveTabIndex(getInsertIndex(dayjs(fields.date)))
        setEditingDay(null)
        setIsDayModalOpen(false)
      }
    } catch (error) {
      console.error('Error editing day', error)
    }
  }

  return (
    <>
      <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction={'column'} sx={{ mt: 2 }} spacing={1}>
          <Box>
            <Typography variant='subtitle2'>Junket</Typography>
            <Typography variant='h3'>{junket.name}</Typography>
          </Box>
          <Stack direction={'row'} spacing={6}>
            <Box>
              <Typography variant='subtitle2'>Location</Typography>
              <Typography variant='h4'>{junket.location}</Typography>
            </Box>
            {/* <Box>
              <Typography variant='subtitle2'>Description</Typography>
              <Typography variant='h4'>{junket.description}</Typography>
            </Box> */}
            <Box>
              <Typography variant='subtitle2'>Date{days.length > 1 ? 's' : ''}</Typography>
              <Typography variant='h4' sx={{ fontWeight: 'normal' }}>
                {days.map((day, index) => {
                  return (
                    <span
                      style={{ cursor: 'pointer', fontWeight: activeTabIndex === index ? 'bold' : 'normal' }}
                      onClick={() => setActiveTabIndex(index)}
                      key={day.id}
                    >
                      {dayjs(day.date).format('ddd DD MMM') + (index < days.length - 1 ? ', ' : '')}
                    </span>
                  )
                })}
              </Typography>
            </Box>
            {/* <Box>
              <Typography variant='subtitle2'>Duration</Typography>
              <Typography variant='h4'>
                {days.length} day{days.length > 1 ? 's' : ''}
              </Typography>
            </Box> */}
          </Stack>
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <Stack
            direction={'column'}
            spacing={1}
            sx={{
              justifyContent: 'flex-end',
              alignItems: 'end',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, mt: 2, flexWrap: 'wrap' }}>
              {activeTabIndex < days.length && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<Edit />}
                  onClick={() => {
                    setEditingDay(days[activeTabIndex])
                    setIsDayModalOpen(true)
                  }}
                >
                  Edit Day
                </Button>
              )}
              <Button
                size='small'
                variant='contained'
                onClick={() => {
                  setEditingDay(null)
                  setIsDayModalOpen(true)
                }}
              >
                Add Day
              </Button>
              <Button
                size='small'
                variant='contained'
                color='error'
                onClick={() => {
                  fetch(`/days/${days[activeTabIndex].id}`, {
                    method: 'DELETE',
                  })
                  onBoardNeedsRefresh()
                }}
              >
                Delete Day
              </Button>
            </Box>
            <Box sx={{ display: 'flex', overflowX: 'auto' }}></Box>
          </Stack>
        </Stack>
      </Stack>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          {days.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No days have been added yet. Use Add Day to create the first day.</Typography>
            </Box>
          ) : (
            days.map((day, index) => (
              <DayPanel key={day.id} value={activeTabIndex} index={index}>
                <DayComponent day={day} highlightedSlots={highlightedSlots} onBoardNeedsRefresh={onBoardNeedsRefresh} />
              </DayPanel>
            ))
          )}
        </DragDropContext>
      </Box>
      <DayModal
        open={isDayModalOpen}
        onClose={() => {
          setEditingDay(null)
          setIsDayModalOpen(false)
        }}
        day={editingDay ?? undefined}
        shouldDisableDate={(date) => isDateAlreadyAdded(date, editingDay?.id)}
        onSave={async (fields) => {
          const formattedFields = {
            ...fields,
            date: dayjs(fields.date).format('YYYY-MM-DD'),
          }
          if (editingDay) {
            await handleEditDay(editingDay.id, formattedFields)
          } else {
            await handleAddDay(formattedFields)
          }
        }}
      />
    </>
  )
}

export default JunketComponent
