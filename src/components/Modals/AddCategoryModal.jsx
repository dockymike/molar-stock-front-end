// src/components/Modals/AddCategoryModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material'
import { useState } from 'react'

export default function AddCategoryModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')

  const handleAdd = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim() })
    setName('')
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Category</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="warning">
          Cancel
        </Button>
        <Button onClick={handleAdd} variant="contained" color="warning">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
