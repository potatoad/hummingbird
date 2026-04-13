import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'

// Adjust this type to match where you export your types
type SlotData = {
  id: string
  title: string
  description?: string | null
  duration: number
  isVirtual: boolean
  isNote: boolean
}

interface EditSlotModalProps {
  open: boolean
  slot: SlotData
  onClose: () => void
  onSave: (updatedFields: Partial<SlotData>) => Promise<void>
}

export default function EditSlotModal({ open, slot, onClose, onSave }: EditSlotModalProps) {
  const [formData, setFormData] = useState({
    title: slot.title,
    description: slot.description || '',
    durationMinutes: slot.duration / 60, // Convert db seconds to UI minutes
    isVirtual: slot.isVirtual,
    isNote: slot.isNote,
  })

  // Reset the form if the slot data changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: slot.title,
        description: slot.description || '',
        durationMinutes: slot.duration / 60,
        isVirtual: slot.isVirtual,
        isNote: slot.isNote,
      })
    }
  }, [open, slot])

  const handleSubmit = () => {
    onSave({
      title: formData.title,
      description: formData.description,
      duration: formData.durationMinutes * 60, // Convert back to seconds
      isVirtual: formData.isVirtual,
      isNote: formData.isNote,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Slot</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <TextField
          label='Title'
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          fullWidth
          margin='dense'
        />
        <TextField
          label='Description'
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={3}
          margin='dense'
        />
        <TextField
          label='Duration (minutes)'
          type='number'
          value={formData.durationMinutes}
          onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
          fullWidth
          margin='dense'
        />
        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isVirtual}
                onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
              />
            }
            label='Virtual Event'
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.isNote}
                onChange={(e) => setFormData({ ...formData, isNote: e.target.checked })}
              />
            }
            label='Is a Note'
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color='inherit'>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant='contained' color='primary'>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
