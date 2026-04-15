import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import type { Day } from '../../utils/types'

interface DayModalProps {
  open: boolean
  onClose: () => void
  day?: Day
  shouldDisableDate?: (date: Dayjs | null) => boolean
  onSave: (payload: { date: Dayjs; greenroomUrl: string; greenroomPassword: string }) => Promise<void>
}

export default function DayModal({ open, onClose, day, shouldDisableDate, onSave }: DayModalProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
  const [greenroomUrl, setGreenroomUrl] = useState('')
  const [greenroomPassword, setGreenroomPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedDate(day ? dayjs(day.date) : dayjs())
      setGreenroomUrl(day?.greenroomUrl ?? '')
      setGreenroomPassword(day?.greenroomPassword ?? '')
    }
  }, [day, open])

  const handleSave = async () => {
    if (!selectedDate) return
    setIsSaving(true)
    try {
      await onSave({
        date: selectedDate,
        greenroomUrl,
        greenroomPassword,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>{day ? 'Edit Day' : 'Add Day'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <Typography variant='body2'>{day ? 'Update the selected day.' : 'Add a new day to this junket.'}</Typography>
        <DatePicker
          value={selectedDate}
          onChange={(value) => setSelectedDate(value)}
          onAccept={(value) => value && setSelectedDate(value)}
          shouldDisableDate={shouldDisableDate}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: 'dense',
            },
          }}
        />
        <TextField
          label='Greenroom URL'
          value={greenroomUrl}
          onChange={(e) => setGreenroomUrl(e.target.value)}
          fullWidth
          margin='dense'
        />
        <TextField
          label='Greenroom Password'
          value={greenroomPassword}
          onChange={(e) => setGreenroomPassword(e.target.value)}
          fullWidth
          margin='dense'
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button variant='contained' onClick={handleSave} disabled={isSaving}>
          {day ? 'Save Changes' : 'Add Day'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
