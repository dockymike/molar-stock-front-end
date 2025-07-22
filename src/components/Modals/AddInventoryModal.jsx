// AddInventoryModal.jsx – handles only selection of Scan or Manual

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

export default function AddInventoryModal({ open, onClose, onInventoryAdded }) {
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
        <DialogTitle>Add Inventory</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <Typography>Choose how you'd like to add inventory:</Typography>
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

      <ManualAdd
        open={openManual}
        onClose={() => {
          setOpenManual(false)
        }}
        onInventoryAdded={onInventoryAdded}
      />
      <ScanAdd
        open={openScan}
        onClose={() => {
          setOpenScan(false)
        }}
        onInventoryAdded={onInventoryAdded}
      />
    </>
  )
}
