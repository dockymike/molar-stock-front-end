// src/components/Modals/EditRevisedModal.jsx
// src/components/Modals/EditRevisedModal.jsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from 'react'

export default function EditRevisedModal({
  open,
  onClose,
  onSave,
  title = 'Edit Item',
  initialData = {},
  ContentComponent,
}) {
  const [formData, setFormData] = useState(initialData || {})

  useEffect(() => {
    setFormData(initialData || {})
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1,
        }}
      >
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Stack spacing={2} mt={1}>
          {ContentComponent && (
            <ContentComponent formData={formData} onChange={handleChange} />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
