import { Snackbar, Alert, Button } from '@mui/material'

export default function ScanResultToast({ open, onClose, message, undo }) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
      <Alert
        onClose={onClose}
        severity="success"
        action={
          undo && (
            <Button onClick={undo} color="inherit" size="small">
              Undo
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  )
}
