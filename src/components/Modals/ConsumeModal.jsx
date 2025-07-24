// src/components/Scanning/ConsumeModal.jsx
// ConsumeModal.jsx – handles Scan (USB), Scan (Camera), and Manual Entry for consumption

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
import CameraConsume from './CameraConsume' // ✅ NEW: import CameraConsume

export default function ConsumeModal({ open, onClose, onInventoryConsumed }) {
  const [openManual, setOpenManual] = useState(false)
  const [openScan, setOpenScan] = useState(false)
  const [openCameraScan, setOpenCameraScan] = useState(false)

  const handleCloseAll = () => {
    setOpenManual(false)
    setOpenScan(false)
    setOpenCameraScan(false)
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
              variant="contained"
              fullWidth
              onClick={() => {
                onClose()
                setOpenCameraScan(true)
              }}
            >
              Scan w/Phone or Tablet Camera
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                onClose()
                setOpenScan(true)
              }}
            >
              Scan w/USB Scanner
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                onClose()
                setOpenManual(true)
              }}
            >
              Manual Entry
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Existing modals – unchanged */}
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

      {/* ✅ Replace placeholder with real CameraConsume modal */}
      <CameraConsume
        open={openCameraScan}
        onClose={() => setOpenCameraScan(false)}
        onInventoryConsumed={onInventoryConsumed}
      />
    </>
  )
}
