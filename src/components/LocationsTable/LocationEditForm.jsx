// src/components/LocationsTable/LocationEditForm.jsx
// src/components/LocationsTable/LocationEditForm.jsx

import { TextField, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import EditModal from '../Modals/EditModal'

export default function LocationEditForm({ open, initialData, onClose, onSave }) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (initialData?.name) {
      setName(initialData.name)
    }
  }, [initialData])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ name: trimmed })
  }

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title="Edit Location"
      onSave={handleSubmit}
    >
      <Stack spacing={2} mt={1}>
        <TextField
          label="Location Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          autoFocus
        />
      </Stack>
    </EditModal>
  )
}
