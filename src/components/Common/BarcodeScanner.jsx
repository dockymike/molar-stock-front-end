// BarcodeScanner.jsx – Barcode scanning component with keyboard input handling

import {
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { lookupBarcode, addItemByBarcode } from '../../services/BarcodeService'
import { useUser } from '../../context/UserContext'

export default function BarcodeScanner({
  active,
  locationId,
  scanMode,
  quantity = 1,
  mode = 'add', // ✅ NEW: 'add' (default) or 'consume'
  onChange,
  onNewItemAdded, // optional callback for new items
}) {
  const [buffer, setBuffer] = useState('')
  const [notFoundBarcode, setNotFoundBarcode] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [scannedItems, setScannedItems] = useState([])

  const timeoutRef = useRef(null)
  const { isAuthenticated } = useUser()
  const [scannerActive, setScannerActive] = useState(active)

  useEffect(() => setScannerActive(active), [active])

  /* ───────── key listener ───────── */
  useEffect(() => {
    if (!scannerActive) return

    const handleKeyPress = (e) => {
      const key = e.key
      if (key === 'Enter') {
        const trimmed = buffer.trim()
        if (trimmed.length) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current)
          processBarcode(trimmed)
          setBuffer('')
        }
        return
      }
      if (key.length !== 1) return

      setBuffer((prev) => {
        const next = prev + key
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => {
          const trimmed = next.trim()
          if (trimmed.length) processBarcode(trimmed)
          setBuffer('')
        }, 300)
        return next
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [scannerActive, buffer])

  /* ───────── process scanned barcode ───────── */
  const processBarcode = async (barcode) => {
    if (!barcode) return
    try {
      const item = await lookupBarcode(barcode)

      const updated = [...scannedItems, { inventory_id: item.id, quantity, item }]
      setScannedItems(updated)
      onChange?.({ item, quantity }) // ✅ Found item
    } catch (err) {
      console.error('Barcode lookup failed:', err)

      if (mode === 'consume') {
        // ✅ Just send an error to parent, don’t show dialog
        onChange?.({
          error: true,
          barcode,
          message: `Item not found in inventory: ${barcode}`,
        })
        return
      }

      // Default behavior: show add-item dialog
      setNotFoundBarcode(barcode)
      setNewItemName('')
      setScannerActive(false)
    }
  }

  /* ───────── add new item flow ───────── */
  const handleAddNewItem = async () => {
    if (!newItemName.trim()) return
    try {
      const result = await addItemByBarcode({
        barcode: notFoundBarcode,
        name: newItemName.trim(),
        quantity,
        location: locationId,
      })

      setScannedItems((prev) => [...prev, { inventory_id: result.id, quantity, item: result }])
      onChange?.({ item: result, quantity })
      onNewItemAdded?.(result, quantity)
    } catch (err) {
      console.error('Failed to add new item:', err)
    }

    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
  }

  const handleCancelNotFound = () => {
    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
  }

  /* ───────── render ───────── */
  return (
    <Dialog open={!!notFoundBarcode && mode === 'add'} onClose={handleCancelNotFound} maxWidth="xs" fullWidth>
      <DialogTitle>Barcode Not Found</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Barcode <strong>{notFoundBarcode}</strong> was not found. Enter a name to add this new item:
        </Typography>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            fullWidth
            autoFocus
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelNotFound}>Cancel</Button>
        <Button onClick={handleAddNewItem} variant="contained">
          Add Item
        </Button>
      </DialogActions>
    </Dialog>
  )
}
