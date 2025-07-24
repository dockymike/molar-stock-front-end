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
import { BrowserMultiFormatReader } from '@zxing/browser'
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
  const [isPausedAfterDetection, setIsPausedAfterDetection] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [scannedItems, setScannedItems] = useState([])

  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)
  const streamRef = useRef(null)
  const { isAuthenticated } = useUser()

  useEffect(() => setScannerActive(active), [active])

  useEffect(() => {
    if (!scannerActive) return
    startCamera()

    return () => stopCamera()
  }, [scannerActive])

const startCamera = async () => {
  try {
    codeReaderRef.current = new BrowserMultiFormatReader()
    const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()
    const selectedDeviceId = videoInputDevices[0]?.deviceId

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: selectedDeviceId },
    })

    streamRef.current = stream

    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream
      // Do NOT call .play() — ZXing will handle it internally
    }

    const result = await codeReaderRef.current.decodeOnceFromStream(
      stream,
      videoRef.current
    )

    if (result?.text) {
      setDetectedBarcode(result.text)
      setIsPausedAfterDetection(true)
      stopCamera()
    }
  } catch (err) {
    console.error('Camera init error:', err)
  } finally {
    setIsCameraReady(true)
  }
}




const stopCamera = () => {
  try {
    // Safely close the decoder
    if (codeReaderRef.current && typeof codeReaderRef.current.close === 'function') {
      codeReaderRef.current.close()
    }

    // Safely stop all tracks
    const tracks = videoRef.current?.srcObject?.getTracks()
    if (tracks) {
      tracks.forEach((track) => track.stop())
    }

    // Only set srcObject to null if videoRef is not null
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null
    }
  } catch (err) {
    console.error('Failed to stop camera:', err)
  }
}


const handleTapToRestart = () => {
  if (!scannerActive) return

  setDetectedBarcode('')
  setIsPausedAfterDetection(false)
  setIsCameraReady(false)

  // Restart camera after small delay to let UI update
  setTimeout(() => {
    startCamera()
  }, 100)
}


  const handleCaptureClick = async () => {
    if (!detectedBarcode) return
    try {
      const item = await lookupBarcode(detectedBarcode)
      const updated = [...scannedItems, { inventory_id: item.id, quantity, item }]
      setScannedItems(updated)
      onChange?.({ item, quantity })
    } catch (err) {
      console.error('Barcode lookup failed:', err)
      if (mode === 'consume') {
        onChange?.({
          error: true,
          barcode: detectedBarcode,
          message: `Item not found in inventory: ${detectedBarcode}`,
        })
        handleTapToRestart()
      } else {
        setNotFoundBarcode(detectedBarcode)
        setNewItemName('')
        setScannerActive(false)
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
      console.error('Failed to add new item:', err)
    }

    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
    handleTapToRestart()
  }

  const handleCancelNotFound = () => {
    setNotFoundBarcode('')
    setNewItemName('')
    setScannerActive(true)
    handleTapToRestart()
  }

  return (
    <>
      {scannerActive && (
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
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
            <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

            {isPausedAfterDetection && (
<Box
  onClick={handleTapToRestart}
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
    cursor: 'pointer', // <-- important
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

          <Button
            variant="contained"
            onClick={handleCaptureClick}
            sx={{ mt: 1 }}
            disabled={!detectedBarcode}
          >
            ➕ Add +1
          </Button>
        </Stack>
      )}

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
