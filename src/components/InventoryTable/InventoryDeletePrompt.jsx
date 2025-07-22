// src/components/InventoryTable/InventoryDeletePrompt.jsx
// src/components/InventoryTable/InventoryDeletePrompt.jsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

export default function InventoryDeletePrompt({
  open,
  onClose,
  onConfirm,
  itemName,
  errorMessage,
}) {
  const hasError = Boolean(errorMessage)

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{itemName}</strong>?
        </Typography>

        {hasError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{hasError ? 'OK' : 'Cancel'}</Button>
        {!hasError && (
          <Button onClick={onConfirm} color="error" variant="contained">
            Delete
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}


