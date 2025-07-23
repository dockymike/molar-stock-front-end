// AddInventoryModal.jsx – handles Scan (USB), Scan (Camera), and Manual Entry

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
import ManualAdd from './ManualAdd'
import ScanAdd from './ScanAdd'
import CameraAdd from './CameraAdd' // ✅ NEW: import CameraAdd

export default function AddInventoryModal({ open, onClose, onInventoryAdded }) {
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
        <DialogTitle>Add Inventory</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Typography>Choose how you'd like to add inventory:</Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                onClose()
                setOpenCameraScan(true)
              }}
            >
              *UNSTABLE - Development in Progress* Scan w/Phone or Tablet Camera
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
      <ManualAdd
        open={openManual}
        onClose={() => setOpenManual(false)}
        onInventoryAdded={onInventoryAdded}
      />
      <ScanAdd
        open={openScan}
        onClose={() => setOpenScan(false)}
        onInventoryAdded={onInventoryAdded}
      />

      {/* ✅ Replace placeholder with real CameraAdd modal */}
      <CameraAdd
        open={openCameraScan}
        onClose={() => setOpenCameraScan(false)}
        onInventoryAdded={onInventoryAdded}
      />
    </>
  )
}

