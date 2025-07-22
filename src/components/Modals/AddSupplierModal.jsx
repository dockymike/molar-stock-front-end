// src/components/Modals/AddSupplierModal.jsx

// src/components/Modals/AddSupplierModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material'
import { useState } from 'react'
import { useUser } from '../../context/UserContext' // ✅ Import context

export default function AddSupplierModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('')
  const { user } = useUser() // ✅ Access user from context

  const handleSubmit = () => {
    if (!name.trim() || !user?.id) return
    onAdd({ name: name.trim(), user_id: user.id }) // ✅ Add user_id to payload
    setName('')
    onClose()
  }

  const handleCancel = () => {
    setName('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Add Supplier</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Supplier Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
