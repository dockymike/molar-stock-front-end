// src/components/CategoriesTable/CategoryDeletePrompt.jsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

export default function CategoryDeletePrompt({ open, onClose, onConfirm, category }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Category</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{category?.name}</strong>?
        </Typography>
        <Typography variant="body2" mt={1} color="text.secondary">
          If this category is in use by any supplies, you must remove those assignments first.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
