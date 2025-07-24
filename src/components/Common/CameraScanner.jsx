import {
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import Quagga from 'quagga'
import { lookupBarcode, addItemByBarcode } from '../../services/BarcodeService'
import { useUser } from '../../context/UserContext'

export default function BarcodeScanner({
  active,
  locationId,
  quantity = 1,
  mode = 'add',
  onChange,
  onNewItemAdded,
}) {
  const [scannerActive, setScannerActive] = useState(active)
  const [detectedBarcode, setDetectedBarcode] = useState('')
  const [notFoundBarcode, setNotFoundBarcode] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [scannedItems, setScannedItems] = useState([])
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isPausedAfterDetection, setIsPausedAfterDetection] = useState(false)

  const videoRef = useRef(null)
  const lastScanned = useRef(null)
  const { isAuthenticated } = useUser()

  useEffect(() => setScannerActive(active), [active])

  useEffect(() => {
    if (!scannerActive || !videoRef.current) return

    initQuagga()

    return () => {
      Quagga.offDetected(handleDetected)
      Quagga.stop()
    }
  }, [scannerActive])

  const initQuagga = () => {
    Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: videoRef.current,
          constraints: { facingMode: 'environment' },
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
        setIsCameraReady(true)
      }
    )
    Quagga.onDetected(handleDetected)
  }

  const handleDetected = (result) => {
    const code = result?.codeResult?.code
    if (!code || code === lastScanned.current) return

    lastScanned.current = code
    setDetectedBarcode(code)
    setIsPausedAfterDetection(true)
    Quagga.stop()
    setIsCameraReady(false)
  }

const handleCaptureClick = async () => {
  if (!detectedBarcode) return

  try {
    const item = await lookupBarcode(detectedBarcode)
    const updated = [...scannedItems, { inventory_id: item.id, quantity, item }]
    setScannedItems(updated)
    onChange?.({ item, quantity })

    // Don't restart scanner — allow user to click Add +1 repeatedly
    setDetectedBarcode(detectedBarcode)
  } catch (err) {
    console.error('Barcode lookup failed:', err)

    if (mode === 'consume') {
      onChange?.({
        error: true,
        barcode: detectedBarcode,
        message: `Item not found in inventory: ${detectedBarcode}`,
      })
      restartScanner()
    } else {
      setNotFoundBarcode(detectedBarcode)
      setNewItemName('')
      setScannerActive(false)
    }
  }
}


  const restartScanner = () => {
    setDetectedBarcode('')
    lastScanned.current = null
    setIsPausedAfterDetection(false)
    Quagga.stop()
    initQuagga()
  }

const handleTapToRestart = () => {
  if (!scannerActive || isCameraReady) return // don't restart if already running
  console.log('🔄 Tap to restart camera stream')
  restartScanner()
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
      console.error('Failed to add new item:', err)
    }

    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
    restartScanner()
  }

  const handleCancelNotFound = () => {
    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
    restartScanner()
  }

  return (
    <>
      {scannerActive && (
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
          {/* Camera Box */}
          <Box
            onClick={handleTapToRestart}

            sx={{
              width: '100%',
              maxWidth: 360,
              aspectRatio: '4 / 3',
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: '#000',
              border: '1px solid #ccc',
              position: 'relative',
              cursor: isPausedAfterDetection ? 'pointer' : 'default',
            }}
          >
            <div ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {/* Freeze Overlay */}
            {isPausedAfterDetection && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  px: 2,
                }}
              >
                Tap to scan next barcode
              </Box>
            )}
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {isCameraReady
              ? detectedBarcode
                ? `Detected: ${detectedBarcode}`
                : '🎥 Ready to scan…'
              : isPausedAfterDetection
              ? `Scan paused for barcode: ${detectedBarcode}`
              : '🔄 Initializing camera…'}
          </Typography>

          {isPausedAfterDetection && (
<Button
  variant="contained"
  onClick={handleCaptureClick}
  sx={{ mt: 1 }}
  disabled={!detectedBarcode}
>
  ➕ Add +1
</Button>
          )}
        </Stack>
      )}

      {/* Not Found Dialog */}
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
    </>
  )
}
