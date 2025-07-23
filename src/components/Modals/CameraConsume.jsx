// CameraConsume.jsx – Camera-based inventory consumption modal

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import DropDownSelect from '../Common/DropDownSelect'
import CameraScanner from '../Common/CameraScanner'
import { fetchInventoryOptions, consumeInventory } from '../../services/InventoryService'
import { fetchLocations } from '../../services/LocationService'
import { useUser } from '../../context/UserContext'
import { useSnackbar } from 'notistack'
import { useLowStock } from '../../context/LowStockContext'

export default function CameraConsume({ open, onClose, onInventoryConsumed }) {
  const [location, setLocation] = useState(null)
  const [supplyOptions, setSupplyOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  const isProcessingRef = useRef(false)
  const dummyFocusRef = useRef(null)
  const locationSelectRef = useRef(null)

  const { user, isAuthenticated } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const { triggerLowStockRefresh } = useLowStock()

  useEffect(() => {
    if (open && user && isAuthenticated) {
      setLocation(null)
      setSupplyOptions([])
      setLocationOptions([])
      setIsLoadingData(true)

      const load = async () => {
        try {
          const invOptions = await fetchInventoryOptions()
          const locs = await fetchLocations()
          setSupplyOptions(invOptions)
          setLocationOptions(locs)
        } catch (err) {
          console.error('Failed to fetch dropdown data:', err)
        } finally {
          setIsLoadingData(false)
        }
      }
      load()
    } else if (!open) {
      setLocation(null)
      setSupplyOptions([])
      setLocationOptions([])
      setIsLoadingData(false)
    }

    isProcessingRef.current = false
  }, [open, user, isAuthenticated])

  const handleScan = async ({ item, quantity: scannedQty = 1, error, message }) => {
    if (error) {
      enqueueSnackbar(message || 'Item not found in inventory', { variant: 'error' })
      return
    }

    if (isProcessingRef.current) return
    isProcessingRef.current = true

    const matched = supplyOptions.find((opt) => opt.inventory_id === item.id)
    if (!matched) {
      enqueueSnackbar(`Item not found in inventory: "${item.name || item.barcode || 'Unknown'}"`, {
        variant: 'error',
      })
      isProcessingRef.current = false
      return
    }

    if (!location) {
      enqueueSnackbar('Please select a location before scanning.', {
        variant: 'warning',
      })
      isProcessingRef.current = false
      return
    }

    const payload = {
      method: 'consume',
      location: Number(location.id),
      entryType: 'scan',
      scanMode: 'fast',
      quantity: scannedQty,
      supplies: [
        {
          isNew: false,
          inventory_id: matched.inventory_id,
          quantity: scannedQty,
          location_id: Number(location.id),
        },
      ],
    }

    try {
      const result = await consumeInventory(payload)
      const toastMsg = `–${scannedQty}x ${item.name} consumed from "${location.name}"`
      enqueueSnackbar(toastMsg, { variant: 'info' })
      onInventoryConsumed?.()
      setTimeout(() => {
        triggerLowStockRefresh()
      }, 100)
    } catch (err) {
      const errMsg = `${err.response?.data?.error || 'Failed to consume'} ${item.name}`
      console.error('Error consuming inventory:', errMsg, err)
      enqueueSnackbar(errMsg, { variant: 'error' })
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false
      }, 200)
    }
  }

  const scannerActive = Boolean(open && location)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Consume Inventory w/ Camera</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          {/* Loading State */}
          {isLoadingData && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading locations...</Typography>
            </Stack>
          )}

          {/* Location Selector */}
          {!isLoadingData && (
            <>
              <DropDownSelect
                label="Select Location"
                value={location?.id || ''}
                onChange={(val) => {
                  const selected = locationOptions.find((loc) => loc.id === Number(val))
                  setLocation(selected)

                  // 👇 Force blur after selection
                  setTimeout(() => {
                    dummyFocusRef.current?.focus()
                  }, 100)
                }}
                options={locationOptions.map((loc) => ({ id: loc.id, name: loc.name }))}
                inputRef={locationSelectRef}
              />

              {/* Dummy element to take focus */}
              <Button
                ref={dummyFocusRef}
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              >
                dummy
              </Button>
            </>
          )}

          {/* Camera Scanner */}
          <CameraScanner
            key={`consume-camera-${location?.id || 'none'}`}
            active={scannerActive}
            locationId={Number(location?.id)}
            scanMode="fast"
            quantity={1}
            mode="consume"
            onChange={handleScan}
          />

          {scannerActive && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Camera active…</Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
