import { Box, Button, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import type { Day } from '../../utils/types'
import RoomComponent from '../room/Room'
import RoomModal from '../room/RoomModal'

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
      {day.greenroomUrl && (
        <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Stack direction={'row'} spacing={6}>
            <Box>
              <Typography variant='subtitle2'>Greenroom</Typography>
              <Typography variant='h4'>
                {day.greenroomUrl && (
                  <a href={day.greenroomUrl} target='_blank' rel='noreferrer'>
                    {day.greenroomUrl}
                  </a>
                )}
              </Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2'>Greenroom Password</Typography>
              <Typography variant='h4'>{day.greenroomPassword || ''}</Typography>
            </Box>
            <Box>
              <Typography variant='subtitle2'>Press Hospitality</Typography>
              <Typography variant='h4'>
                {day.pressHospitalityURL && (
                  <a href={day.pressHospitalityURL} target='_blank' rel='noreferrer'>
                    {day.pressHospitalityURL}
                  </a>
                )}
              </Typography>
            </Box>
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <Button
              variant='contained'
              color='success'
              size='small'
              onClick={() => {
                setOpen(true)
              }}
            >
              Add Room
            </Button>
          </Stack>
        </Stack>
      )}
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, height: '100%' }}>
        {day.rooms.map((room, index) => (
          <RoomComponent
            key={room.id}
            room={room}
            index={index}
            highlightedSlots={highlightedSlots}
            onBoardNeedsRefresh={onBoardNeedsRefresh}
          />
        ))}
      </Box>
      <RoomModal
        open={open}
        onClose={onClose}
        dayId={day.id}
        numberOfRooms={day.rooms.length}
        handleDeleteRoom={onBoardNeedsRefresh}
      />
    </>
  )
}

export default DayComponent
