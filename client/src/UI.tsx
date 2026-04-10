import { EditSquare } from '@mui/icons-material'
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material'
import contrastingColor from './contrastingColor'
import { data } from './data'

export default function App() {
  return (
    <>
      <Box sx={{ width: '750px' }}>
        {data.map((item, index) => {
          let colour = '#ffffff'
          switch (item.status) {
            case 'COMPLETED':
              colour = '#e6b8af'
              break
            case 'IN INTERVIEW':
              colour = '#f9cb9c'
              break
            case 'ON DECK':
              colour = '#b7e1cd'
              break
            case 'CANCELLED':
              colour = '#f2dede'
              break
            default:
              colour = '#eee'
          }

          return (
            <Paper
              elevation={2}
              key={index}
              sx={{
                m: 1,
                textAlign: 'left',
                width: '100%',
                backgroundColor: item.virtual && '#fff2cc',
                overflow: 'hidden',
              }}
            >
              <Grid container>
                <Grid size={9} container sx={{ p: 1 }}>
                  <Grid size={4}>
                    <Typography variant='subtitle2'>Journalist</Typography>
                    <Typography variant='h4' sx={{ textDecoration: item.status === 'CANCELLED' && 'line-through' }}>
                      {item.name}
                    </Typography>
                  </Grid>
                  <Grid size={8}>
                    <Typography variant='subtitle2'>Outlet</Typography>
                    <Typography variant='h5' sx={{ textDecoration: item.status === 'CANCELLED' && 'line-through' }}>
                      {item.outlet}
                    </Typography>
                  </Grid>
                  <Grid size={1}>
                    <Typography variant='subtitle2'>Order</Typography>
                    <Typography variant='h6'>{index + 1}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant='subtitle2'>Territory</Typography>
                    <Typography variant='h6'>{item.territory}</Typography>
                  </Grid>

                  <Grid size={8}>
                    <Typography variant='subtitle2'>Notes</Typography>
                    <Typography variant='h6'>{item.notes}</Typography>
                  </Grid>
                </Grid>
                <Grid size={3} container sx={{ background: colour, p: 1, position: 'relative' }}>
                  <IconButton
                    sx={{
                      p: 0,
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      color: contrastingColor(colour),
                      mixBlendMode: 'overlay',
                    }}
                  >
                    <EditSquare fontSize='small' />
                  </IconButton>
                  <Grid size={12}>
                    <Typography variant='h6'>{item.status ? item.status : '\u00A0'}</Typography>
                    <Typography variant='subtitle2'>Interview length</Typography>
                    <Typography variant='h4'>{Number.parseInt(item.interviewDuration) / 60} mins</Typography>
                    <Grid container>
                      <Grid size={6}>
                        <Typography variant='subtitle2'>Check-in</Typography>
                        <Typography variant='h6'>00:00</Typography>
                      </Grid>
                      <Grid size={6}>
                        <Typography variant='subtitle2'>Start time</Typography>
                        <Typography variant='h6'>00:00</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          )
        })}
      </Box>
    </>
  )
}
