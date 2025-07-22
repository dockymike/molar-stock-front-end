// src/components/Modals/TransferModal.jsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useSnackbar } from 'notistack'
import { useLowStock } from '../../context/LowStockContext'
import { transferInventory } from '../../services/InventoryService'

export default function TransferModal({
  open,
  onClose,
  onTransferred,
  inventoryItem,
  sourceLocationId,
  sourceLocationName,
  locations = [],
}) {
  const [destinationId, setDestinationId] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [availableQuantity, setAvailableQuantity] = useState(0)

  const { isAuthenticated } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const { triggerLowStockRefresh } = useLowStock()

  useEffect(() => {
    if (inventoryItem && sourceLocationId) {
      const sourceLoc = inventoryItem.allLocations?.find(
        (loc) => loc.location_id === sourceLocationId
      )
      setAvailableQuantity(sourceLoc?.quantity || inventoryItem.quantity || 0)
    }
    setDestinationId('')
    setQuantity(0)
  }, [inventoryItem, sourceLocationId])

  const handleSubmit = async () => {
    if (
      !sourceLocationId ||
      !destinationId ||
      quantity <= 0 ||
      sourceLocationId === destinationId
    )
      return

    const payload = {
      inventory_id: inventoryItem.inventory_id,
      source_location_id: sourceLocationId,
      destination_location_id: destinationId,
      quantity: Number(quantity),
    }


    try {
      await transferInventory(payload)
      enqueueSnackbar(`Transferred ${quantity}x ${inventoryItem.name}`, {
        variant: 'success',
      })
      onTransferred?.()

      // Add small delay to ensure database transaction is committed before refreshing alerts
      setTimeout(() => {
        triggerLowStockRefresh()
      }, 100)

      onClose()
    } catch (err) {
      const errMsg =
        err?.response?.data?.error || 'Transfer failed. Please try again.'
      console.error('Transfer failed:', errMsg)
      enqueueSnackbar(`${errMsg}`, { variant: 'error' })
    }
  }

  const isDisabled =
    !destinationId ||
    quantity <= 0 ||
    sourceLocationId === destinationId ||
    quantity > availableQuantity

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer Inventory</DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          <Typography variant="body1">
            Product: <strong>{inventoryItem?.name || '—'}</strong>
          </Typography>

          <TextField
            fullWidth
            label="Source Location"
            value={sourceLocationName || '—'}
            InputProps={{ readOnly: true }}
            disabled
          />

          {availableQuantity > 0 && (
            <Typography variant="body1" color="text.secondary">
              Available at source: {availableQuantity}
            </Typography>
          )}

          <FormControl fullWidth>
            <InputLabel>Destination Location</InputLabel>
            <Select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              label="Destination Location"
            >
              {locations
                .filter((loc) => loc.id !== sourceLocationId)
                .map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Quantity to Transfer"
            type="number"
            inputProps={{ min: 1, max: availableQuantity }}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          variant="contained"
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
