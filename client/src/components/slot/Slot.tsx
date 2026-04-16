import { DragHandle, EditSquare } from '@mui/icons-material'
import { Box, FormControl, Grid, IconButton, MenuItem, Paper, Select, Typography } from '@mui/material'
import React, { useState } from 'react'
import { contrastingColor, contrastingColorBlendMode } from '../../utils/contrastingColor'
import { getStatusColor } from '../../utils/statusColors'
import type { Slot } from '../../utils/types'
import EditSlotModal from './SlotModal' // <-- Make sure this path is correct for your app!

// Extend Slot specifically for the UI to accept the calculated time from Room
type SlotWithTime = Slot & { calculatedStartTime?: string }

interface SlotProps {
  slot: SlotWithTime
  index: number
  isHighlighted: boolean
  onBoardNeedsRefresh?: () => void // <-- Added this prop
}

const SlotComponent: React.FC<SlotProps> = ({ slot, index, isHighlighted, onBoardNeedsRefresh }) => {
  const isCancelled = slot.status === 'CANCELLED'
  // const isBreak = slot.slotType === 'BREAK' || slot.slotType === 'BUFFER'

  // Use the slot's DB color, or fallback to the status color map
  const color = getStatusColor(slot.isBreak, slot.status)

  // Removed the incorrect `: boolean` type annotation here
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Added type `any` (or Partial<Slot>) to avoid TS errors
  const handleSave = async (updatedFields: unknown) => {
    try {
      const response = await fetch(`/slots/${slot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      })

      if (response.ok) {
        setIsModalOpen(false)
        if (onBoardNeedsRefresh) onBoardNeedsRefresh()
      }
    } catch (error) {
      console.error('Failed to update slot:', error)
    }
  }

  // Wrap the entire return in a Fragment so <Draggable> doesn't get confused by the Modal
  return (
    <>
      <Paper
        elevation={isHighlighted ? 6 : 2}
        sx={{
          mb: 1,
          textAlign: 'left',
          width: '100%',
          backgroundColor: slot.isVirtual ? '#fff2cc' : slot.isBreak ? '#dadada' : undefined,
          overflow: 'hidden',
          boxShadow: isHighlighted ? `0 0 10px 2px ${color}` : undefined,
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        <Grid container>
          {/* Left Content Area */}
          <Grid size={9} container sx={{ p: 1 }}>
            {slot.isBreak ? (
              <Box sx={{ alignContent: 'center', textAlign: 'center', width: '100%' }}>
                <Typography variant='h5'>{slot.name}</Typography>
              </Box>
            ) : (
              <>
                <Grid size={5}>
                  <Typography variant='subtitle2'>Journalist</Typography>
                  <Typography variant='h4' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    {slot.name || ''}
                  </Typography>
                </Grid>
                <Grid size={7}>
                  <Typography variant='subtitle2'>Outlet</Typography>
                  <Typography variant='h5' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    {slot.outlet || ''}
                  </Typography>
                </Grid>
                <Grid size={1}>
                  <Typography variant='subtitle2'>Order</Typography>
                  <Typography variant='h6'>{index}</Typography>
                </Grid>
                <Grid size={2}>
                  <Typography variant='subtitle2'>Check-in</Typography>
                  <Typography variant='h6'>{slot.checkInTime ? String(slot.checkInTime) : ''}</Typography>
                </Grid>
                <Grid size={2}>
                  <Typography variant='subtitle2'>Territory</Typography>
                  <Typography variant='h6'>{slot.territory || ''}</Typography>
                </Grid>
                <Grid size={7}>
                  <Typography variant='subtitle2'>Notes</Typography>
                  <Typography variant='h6'>{slot.notes || ''}</Typography>
                </Grid>
              </>
            )}
          </Grid>

          {/* Right Status Area */}
          <Grid size={3} container sx={{ background: color, p: 1, position: 'relative' }}>
            {/* Hooked up the onClick handler to open the modal */}
            <IconButton
              aria-label='edit slot'
              onClick={() => setIsModalOpen(true)}
              sx={{
                p: 0,
                position: 'absolute',
                top: '5px',
                right: '5px',
                color: contrastingColor(color),
                mixBlendMode: contrastingColorBlendMode ? contrastingColorBlendMode(color) : 'overlay',
              }}
            >
              <EditSquare fontSize='small' />
            </IconButton>

            <IconButton
              aria-label='drag slot'
              sx={{
                p: 0,
                position: 'absolute',
                bottom: 0,
                right: '5px',
                color: contrastingColor(color),
                mixBlendMode: contrastingColorBlendMode ? contrastingColorBlendMode(color) : 'overlay',
                cursor: 'grab',
              }}
            >
              <DragHandle fontSize='small' />
            </IconButton>

            <Grid size={12} sx={{ pr: '1.25em' }}>
              <>
                {!slot.isBreak && (
                  <FormControl variant='standard' fullWidth sx={{ mb: 1 }}>
                    {/* <InputLabel>Status</InputLabel> */}
                    <Select
                      label='Status'
                      value={slot.status}
                      onChange={(e) => {
                        handleSave({ status: e.target.value })
                      }}
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        padding: 0,
                      }}
                    >
                      <MenuItem disabled value=''>
                        <em>Status</em>
                      </MenuItem>
                      <MenuItem value={'ARRIVED'}>ARRIVED</MenuItem>
                      <MenuItem value={'WAITING'}>WAITING</MenuItem>
                      <MenuItem value={'INTERVIEW'}>INTERVIEW</MenuItem>
                      <MenuItem value={'COMPLETED'}>COMPLETED</MenuItem>
                      <MenuItem value={'CANCELLED'}>CANCELLED</MenuItem>
                    </Select>
                  </FormControl>
                )}
                <Grid container>
                  <Grid size={6}>
                    <Typography variant='subtitle2'>Start time</Typography>
                    <Typography variant='h5'>{slot.calculatedStartTime || '00:00'}</Typography>
                  </Grid>
                  <Grid size={6}>
                    <Typography variant='subtitle2'>Duration</Typography>
                    <Typography variant='h5' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                      {(slot.duration as number) / 60} {(slot.duration as number) / 60 > 1 ? 'mins' : 'min'}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Render the modal locally, but controlled by state. Keep it OUTSIDE the Draggable! */}
      <EditSlotModal open={isModalOpen} slot={slot} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </>
  )
}

export default SlotComponent
