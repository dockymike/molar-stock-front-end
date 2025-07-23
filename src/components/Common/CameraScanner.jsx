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
import Quagga from 'quagga'

export default function CameraScanner({
  active,
  locationId,
  scanMode,
  quantity = 1,
  mode = 'add',
  onChange,
  onNewItemAdded,
}) {
  const [notFoundBarcode, setNotFoundBarcode] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [ready, setReady] = useState(false)
  const [scannedItems, setScannedItems] = useState([])
  const [scannerActive, setScannerActive] = useState(active)
  const [statusText, setStatusText] = useState('✅ Ready for next scan…')

  const lastScanned = useRef(null)
  const videoRef = useRef(null)
  const { isAuthenticated } = useUser()

  useEffect(() => {
    setScannerActive(active)
  }, [active])

  useEffect(() => {
    if (!scannerActive || !videoRef.current) return

    setReady(true)
    setStatusText('✅ Ready for next scan…')

    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: ['code_128_reader', 'ean_reader', 'upc_reader', 'code_39_reader'],
        },
      },
      (err) => {
        if (err) {
          console.error('Quagga init error:', err)
          return
        }
        Quagga.start()
      }
    )

    Quagga.onDetected(handleDetected)

    return () => {
      Quagga.offDetected(handleDetected)
      Quagga.stop()
      setReady(false)
    }
  }, [scannerActive])

  const pauseScanner = () => {
    Quagga.pause()
    setReady(false)
    setStatusText('⏳ Processing...')
  }

  const resumeScanner = () => {
    lastScanned.current = null
    setReady(true)
    setStatusText('✅ Ready for next scan…')
    Quagga.start()
  }

  const handleDetected = async (result) => {
    const code = result?.codeResult?.code
    if (!code || code === lastScanned.current) return

    lastScanned.current = code
    pauseScanner()
    await processBarcode(code)

    setTimeout(() => {
      resumeScanner()
    }, 1200)
  }

  const processBarcode = async (barcode) => {
    try {
      const item = await lookupBarcode(barcode)
      setScannedItems((prev) => [...prev, { inventory_id: item.id, quantity, item }])
      onChange?.({ item, quantity })
    } catch (err) {
      console.error('Barcode not found:', barcode)

      if (mode === 'consume') {
        onChange?.({
          error: true,
          barcode,
          message: `Item not found in inventory: ${barcode}`,
        })
      } else {
        setNotFoundBarcode(barcode)
        setNewItemName('')
        setScannerActive(false)
        Quagga.stop()
      }
    }
  }

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
      console.error('Failed to add item:', err)
    }

    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
    lastScanned.current = null
  }

  const handleCancelNotFound = () => {
    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
    lastScanned.current = null
  }

  return (
    <>
      {scannerActive && (
        <Stack spacing={1} alignItems="center" justifyContent="center">
          <div ref={videoRef} style={{ width: '100%', borderRadius: 8 }} />
          <Typography variant="body2" color="textSecondary">
            {statusText}
          </Typography>
        </Stack>
      )}

      <Dialog
        open={!!notFoundBarcode && mode === 'add'}
        onClose={handleCancelNotFound}
        maxWidth="xs"
        fullWidth
      >
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
    </>
  )
}
