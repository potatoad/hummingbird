import { Draggable } from '@hello-pangea/dnd'
import { DragHandle, EditSquare } from '@mui/icons-material'
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useState } from 'react'
import { contrastingColor, contrastingColorBlendMode } from '../../contrastingColor'
import type { Slot } from '../../types'
import { getStatusColor } from '../../utils/statusColors'
import EditSlotModal from '../EditSlotModal' // <-- Make sure this path is correct for your app!

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
  const isBreak = slot.slotType === 'BREAK' || slot.slotType === 'BUFFER'

  // Use the slot's DB colour, or fallback to the status color map
  const colour = getStatusColor(isBreak, slot.status)

  // Removed the incorrect `: boolean` type annotation here
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Added type `any` (or Partial<Slot>) to avoid TS errors
  const handleSave = async (updatedFields: any) => {
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
      <Draggable draggableId={slot.id} index={index}>
        {(provided) => (
          <Paper
            elevation={isHighlighted ? 6 : 2}
            ref={provided.innerRef}
            {...provided.draggableProps}
            sx={{
              m: 1,
              textAlign: 'left',
              width: '100%',
              backgroundColor: slot.isVirtual ? '#fff2cc' : isBreak ? '#dadada' : undefined,
              overflow: 'hidden',
              boxShadow: isHighlighted ? `0 0 10px 2px ${colour}` : undefined,
              transition: 'box-shadow 0.3s ease-in-out',
            }}
          >
            <Grid container>
              {/* Left Content Area */}
              <Grid size={9} container sx={{ p: 1 }}>
                {isBreak ? (
                  <Box sx={{ alignContent: 'center', textAlign: 'center', width: '100%' }}>
                    <Typography variant='h5'>{slot.title}</Typography>
                  </Box>
                ) : (
                  <>
                    <Grid size={4}>
                      <Typography variant='subtitle2'>Journalist</Typography>
                      <Typography variant='h4' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                        {slot.title || ''}
                      </Typography>
                    </Grid>
                    <Grid size={8}>
                      <Typography variant='subtitle2'>Outlet</Typography>
                      <Typography variant='h5' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                        {slot.description || ''}
                      </Typography>
                    </Grid>
                    <Grid size={1}>
                      <Typography variant='subtitle2'>Order</Typography>
                      <Typography variant='h6'>{index}</Typography>
                    </Grid>
                    <Grid size={3}>
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
              <Grid size={3} container sx={{ background: colour, p: 1, position: 'relative' }}>
                {/* Hooked up the onClick handler to open the modal */}
                <IconButton
                  aria-label='edit slot'
                  onClick={() => setIsModalOpen(true)}
                  sx={{
                    p: 0,
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    color: contrastingColor(colour),
                    mixBlendMode: contrastingColorBlendMode ? contrastingColorBlendMode(colour) : 'overlay',
                  }}
                >
                  <EditSquare fontSize='small' />
                </IconButton>

                <IconButton
                  aria-label='drag slot'
                  {...provided.dragHandleProps}
                  sx={{
                    p: 0,
                    position: 'absolute',
                    bottom: 0,
                    right: '5px',
                    color: contrastingColor(colour),
                    mixBlendMode: contrastingColorBlendMode ? contrastingColorBlendMode(colour) : 'overlay',
                    cursor: 'grab',
                  }}
                >
                  <DragHandle fontSize='small' />
                </IconButton>

                <Grid size={12} sx={{ pr: '1em' }}>
                  <>
                    {!isBreak && (
                      <Typography variant='h6' sx={{ mb: 1 }}>
                        {slot.status || '\u00A0'}
                      </Typography>
                    )}
                    <Grid container>
                      <Grid size={6}>
                        <Typography variant='subtitle2'>Start time</Typography>
                        <Typography variant='h5'>{slot.calculatedStartTime || '00:00'}</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant='subtitle2'>Duration</Typography>
                        <Typography variant='h5' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                          {Number.parseInt(slot.duration as number) / 60}{' '}
                          {(slot.duration as number) / 60 > 1 ? 'mins' : 'min'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Draggable>

      {/* Render the modal locally, but controlled by state. Keep it OUTSIDE the Draggable! */}
      <EditSlotModal open={isModalOpen} slot={slot} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
    </>
  )
}

export default SlotComponent
