// src/components/Scanning/ConsumeModal.jsx
// ConsumeModal.jsx – handles only selection of Scan or Manual consumption

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import ManualConsume from './ManualConsume'
import ScanConsume from './ScanConsume'

export default function ConsumeModal({ open, onClose, onInventoryConsumed }) {
  const [openManual, setOpenManual] = useState(false)
  const [openScan, setOpenScan] = useState(false)

  const handleCloseAll = () => {
    setOpenManual(false)
    setOpenScan(false)
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Consume Inventory</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Typography>Choose how you'd like to consume inventory:</Typography>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                onClose() // Close parent modal first
                setOpenScan(true)
              }}
            >
              Scan
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                onClose() // Close parent modal first
                setOpenManual(true)
              }}
            >
              Manual
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <ManualConsume
        open={openManual}
        onClose={() => setOpenManual(false)}
        onInventoryConsumed={onInventoryConsumed}
      />
      <ScanConsume
        open={openScan}
        onClose={() => setOpenScan(false)}
        onInventoryConsumed={onInventoryConsumed}
      />
    </>
  )
}
