// ScanAdd.jsx – Scan inventory modal with barcode scanning

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
import BarcodeScanner from '../Common/BarcodeScanner'
import { fetchInventoryOptions, addInventory } from '../../services/InventoryService'
import { fetchLocations } from '../../services/LocationService'
import { useUser } from '../../context/UserContext'
import { useSnackbar } from 'notistack'

import { useLowStock } from '../../context/LowStockContext'

export default function ScanAdd({ open, onClose, onInventoryAdded }) {
  const [location, setLocation] = useState(null)
  const [supplyOptions, setSupplyOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  const isProcessingRef = useRef(false)
  const locationSelectRef = useRef(null)
  const dummyFocusRef = useRef(null)

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

  const handleScan = async ({ item, quantity: scannedQty = 1 }) => {
    console.log('🧪 handleScan triggered', item, scannedQty)

    if (isProcessingRef.current) return
    isProcessingRef.current = true

    const matched = supplyOptions.find((opt) => opt.inventory_id === item.id)
    if (!matched || !location) {
      isProcessingRef.current = false
      return
    }

    const duplicateNameMatch = supplyOptions.find(
      (opt) => opt.name.toLowerCase() === item.name.toLowerCase()
    )
    if (duplicateNameMatch && duplicateNameMatch.inventory_id !== item.id) {
      enqueueSnackbar(`Item "${item.name}" already exists with different capitalization`, { variant: 'warning' })
      isProcessingRef.current = false
      return
    }

    const payload = {
      destination: 'direct',
      location: Number(location.id),
      supplies: [
        {
          isNew: false,
          inventory_id: matched.inventory_id,
          quantity: scannedQty,
        },
      ],
    }

    try {
      await addInventory(payload)
      enqueueSnackbar(`+${scannedQty}x ${item.name} added to "${location.name}"`, { variant: 'success' })
      onInventoryAdded?.()
      setTimeout(() => {
        triggerLowStockRefresh()
      }, 100)
    } catch (err) {
      const errMsg = `${err.response?.data?.error || 'Failed to add'} ${item.name}`
      console.error('Error adding inventory:', errMsg, err)
      enqueueSnackbar(errMsg, { variant: 'error' })
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false
      }, 200)
    }
  }

  const handleNewItemAdded = async (item, scannedQty) => {
    const locationName = locationOptions.find((loc) => loc.id === Number(location?.id))?.name || 'Unknown'
    const toastMsg = `+${scannedQty}x ${item.name} added to "${locationName}"`
    enqueueSnackbar(toastMsg, { variant: 'success' })
    onInventoryAdded?.()

    setTimeout(() => {
      triggerLowStockRefresh()
    }, 100)

    try {
      const updated = await fetchInventoryOptions()
      setSupplyOptions(updated)
    } catch (err) {
      console.error('Failed to refresh supply options:', err)
    }
  }

  const scannerActive = Boolean(open && location)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Scan Inventory</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          {isLoadingData && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading locations...</Typography>
            </Stack>
          )}

          {!isLoadingData && (
            <>
              <DropDownSelect
                label="Select Location"
                value={location?.id || ''}
                onChange={(val) => {
                  const selected = locationOptions.find((loc) => loc.id === Number(val))
                  setLocation(selected)

                  // 👇 Shift focus to dummy to blur dropdown
                  setTimeout(() => {
                    dummyFocusRef.current?.focus()
                  }, 100)
                }}
                options={locationOptions.map((loc) => ({ id: loc.id, name: loc.name }))}
                inputRef={locationSelectRef}
              />

              {/* 👇 Dummy element for blur */}
              <Button
                ref={dummyFocusRef}
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
              >
                dummy
              </Button>
            </>
          )}

          <BarcodeScanner
            key={`scan-${location?.id || 'none'}`}
            active={scannerActive}
            locationId={Number(location?.id)}
            scanMode="fast"
            quantity={1}
            onChange={handleScan}
            onNewItemAdded={handleNewItemAdded}
          />

          {scannerActive && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">Ready to scan…</Typography>
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
