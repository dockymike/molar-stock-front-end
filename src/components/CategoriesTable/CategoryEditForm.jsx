// src/components/CategoriesTable/CategoryEditForm.jsx

import { TextField, Stack } from '@mui/material'

export default function CategoryEditForm({ formData, onChange }) {
  return (
    <Stack spacing={2} mt={1}>
      <TextField
        label="Category Name"
        name="name"
        value={formData.name || ''}
        onChange={onChange}
        fullWidth
        autoFocus
      />
    </Stack>
  )
}

