import type { DraggableProvided } from '@hello-pangea/dnd'
import { DragHandle, EditSquare } from '@mui/icons-material'
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import { contrastingColor, contrastingColorBlendMode } from '../contrastingColor'
import type { InterviewItem } from '../types'
import { getStatusColor } from '../utils/statusColors'

interface InterviewCardProps {
  item: InterviewItem
  order: number
  provided: DraggableProvided
}

export default function InterviewCard({ item, order, provided }: InterviewCardProps) {
  // Destructure the DnD props here to avoid ESLint false positives
  const { innerRef, draggableProps, dragHandleProps } = provided

  const colour = getStatusColor(item.isBreak, item.status)
  const isCancelled = item.status === 'CANCELLED'

  return (
    <Paper
      elevation={2}
      // Apply the destructured props
      ref={innerRef}
      {...draggableProps}
      sx={{
        m: 1,
        textAlign: 'left',
        width: '100%',
        backgroundColor: item.virtual ? '#fff2cc' : item.isBreak ? '#dadada' : undefined,
        overflow: 'hidden',
      }}
    >
      <Grid container>
        <Grid size={9} container sx={{ p: 1 }}>
          {/* --- Left Content Area --- */}
          {item.isBreak ? (
            <Box sx={{ alignContent: 'center', textAlign: 'center', width: '100%' }}>
              <Typography variant='h3'>{item.breakText}</Typography>
            </Box>
          ) : (
            <>
              <Grid size={4}>
                <Typography variant='subtitle2'>Journalist</Typography>
                <Typography variant='h4' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                  {item.name}
                </Typography>
              </Grid>
              <Grid size={8}>
                <Typography variant='subtitle2'>Outlet</Typography>
                <Typography variant='h5' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                  {item.outlet}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant='subtitle2'>Order</Typography>
                <Typography variant='h6'>{order}</Typography>
              </Grid>
              {/* <Grid size={2}>
                <Typography variant='subtitle2'>Check-in</Typography>
                <Typography variant='h6'>00:00</Typography>
              </Grid> */}
              <Grid size={3}>
                <Typography variant='subtitle2'>Territory</Typography>
                <Typography variant='h6'>{item.territory}</Typography>
              </Grid>
              <Grid size={7}>
                <Typography variant='subtitle2'>Notes</Typography>
                <Typography variant='h6'>{item.notes}</Typography>
              </Grid>
            </>
          )}
        </Grid>

        {/* --- Right Status Area --- */}
        <Grid size={3} container sx={{ background: colour, p: 1, position: 'relative' }}>
          <IconButton
            aria-label='edit interview'
            sx={{
              p: 0,
              position: 'absolute',
              top: '5px',
              right: '5px',
              color: contrastingColor(colour),
              mixBlendMode: contrastingColorBlendMode(colour),
            }}
          >
            <EditSquare fontSize='small' />
          </IconButton>

          <IconButton
            aria-label='drag interview'
            // Apply the destructured drag handle props
            {...dragHandleProps}
            sx={{
              p: 0,
              position: 'absolute',
              bottom: 0,
              right: '5px',
              color: contrastingColor(colour),
              mixBlendMode: contrastingColorBlendMode(colour),
              cursor: 'grab',
            }}
          >
            <DragHandle fontSize='small' />
          </IconButton>

          <Grid size={12}>
            <>
              {!item.isBreak && (
                <Typography variant='h6' sx={{ mb: 1 }}>
                  {item.status || '\u00A0'}
                </Typography>
              )}
              <Grid container>
                <Grid size={6}>
                  <Typography variant='subtitle2'>Start time</Typography>
                  <Typography variant='h5'>{item.calculatedStartTime || '00:00'}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant='subtitle2'>Duration</Typography>
                  <Typography variant='h5' sx={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    {Number.parseInt(item.interviewDuration.toString()) / 60} mins
                  </Typography>
                </Grid>
              </Grid>
            </>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}
