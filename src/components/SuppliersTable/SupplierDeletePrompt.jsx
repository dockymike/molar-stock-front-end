import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

export default function SupplierDeletePrompt({ open, onClose, onConfirm, supplier }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Supplier</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{supplier?.name}</strong>?
        </Typography>
        <Typography variant="body2" mt={1} color="text.secondary">
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
