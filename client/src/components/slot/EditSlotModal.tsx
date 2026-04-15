import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import NumberSpinner from '../NumberSpinner'

type SlotData = {
  id: string
  name: string
  outlet: string
  duration: number
  isVirtual: boolean
  isBreak: boolean
  roomId: string
}

interface EditSlotModalProps {
  open: boolean
  slot: Partial<SlotData>
  onClose: () => void
  onSave: (updatedFields: Partial<SlotData>) => Promise<void>
}

export default function EditSlotModal({ open, slot, onClose, onSave }: EditSlotModalProps) {
  function getInitialFormData(s: Partial<SlotData>) {
    return {
      name: s.name,
      outlet: s.outlet || '',
      durationMinutes: Math.floor((s.duration || 0) / 60),
      durationSeconds: (s.duration || 0) % 60,
      isVirtual: s.isVirtual,
      isBreak: s.isBreak,
      roomId: s.roomId,
    }
  }

  const [formData, setFormData] = useState(() => getInitialFormData(slot))

  const [prevSlotId, setPrevSlotId] = useState(slot.id)
  if (slot.id !== prevSlotId) {
    setFormData(getInitialFormData(slot))
    setPrevSlotId(slot.id)
  }

  const handleSubmit = () => {
    onSave({
      name: formData.name,
      outlet: formData.outlet,
      duration: formData.durationMinutes * 60 + formData.durationSeconds, // Convert back to seconds
      isVirtual: formData.isVirtual,
      isBreak: formData.isBreak,
      roomId: slot.roomId,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Slot</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <TextField
          label='Journalist'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          margin='dense'
        />
        <TextField
          label='Outlet'
          value={formData.outlet}
          onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
          fullWidth
          margin='dense'
        />
        <Stack direction='row' spacing={1} justifyContent='space-between' sx={{ mt: 1 }}>
          <NumberSpinner
            label='Duration (minutes)'
            size='small'
            min={0}
            value={formData.durationMinutes}
            onValueChange={(e) => setFormData({ ...formData, durationMinutes: e || 0 })}
          />
          <NumberSpinner
            label='Duration (seconds)'
            size='small'
            min={0}
            max={45}
            value={formData.durationSeconds}
            step={15}
            onValueChange={(e) => setFormData({ ...formData, durationSeconds: e || 0 })}
          />
          <Stack direction='column' spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isVirtual}
                  onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
                />
              }
              label='Virtual Journalist'
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isBreak}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({ ...formData, isBreak: e.target.checked, outlet: '', isVirtual: false })
                    } else {
                      setFormData({ ...formData, isBreak: e.target.checked })
                    }
                  }}
                />
              }
              label='Break'
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button
          disabled
          onClick={async () => {
            const response = await fetch(`/slots/${slot.id}`, {
              method: 'DELETE',
            })
            if (response.ok) {
              onClose()
              // Note: This assumes the parent handles the refresh via the same mechanism as onSave
              onSave({})
            }
          }}
          color='error'
          sx={{ mr: 'auto' }}
        >
          Delete
        </Button>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>{' '}
        <Button onClick={handleSubmit} variant='contained' color='primary'>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
