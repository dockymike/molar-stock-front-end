// ✅ Updated ScanConsumeModal.jsx without Global option
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Paper, // ✅ Add this here

} from '@mui/material'
import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import useBarcodeScanner from '../hooks/useBarcodeScanner'
import {
  lookupBarcode,
  consumeSupply,
  assignBarcodeToSupply,
  createSupplyWithBarcode,
  checkInSupply,
} from '../services/BarcodeService'
import QuantitySelector from './QuantitySelector'
import { fetchOperatories } from '../../services/OperatoryListService'
import { fetchSupplies } from '../../services/SuppliesService'
import { fetchOpSupplies } from '../../services/OpSuppliesService'
import { cleanBarcode } from '../utils/barcodeParser'

export default function ScanConsumeModal({ open, onClose, user, onSupplyChange }) {
  const { enqueueSnackbar } = useSnackbar()
  const [step, setStep] = useState(1)
  const [selectedOp, setSelectedOp] = useState('')
  const [scanMode, setScanMode] = useState('fast')
  const [quantity, setQuantity] = useState(1)
  const [operatories, setOperatories] = useState([])
  const [supplies, setSupplies] = useState([])
  const [opSupplies, setOpSupplies] = useState([])
  const [modalType, setModalType] = useState(null)
  const [barcodeToHandle, setBarcodeToHandle] = useState('')
  const [assignSupplyId, setAssignSupplyId] = useState('')
  const [newSupplyName, setNewSupplyName] = useState('')
  const [newSupplyUnit, setNewSupplyUnit] = useState('')

  useEffect(() => {
    if (!open) {
      setStep(1)
      setSelectedOp('')
      setScanMode('fast')
      setQuantity(1)
      setModalType(null)
    }
  }, [open])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const ops = await fetchOperatories(user.id, token)
        const sups = await fetchSupplies(user.id, token)
        setOperatories(ops)
        setSupplies(sups)
        if (selectedOp) {
          const opData = await fetchOpSupplies(selectedOp, token)
          setOpSupplies(opData)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    if (open) fetchData()
  }, [open, user.id, selectedOp])

  const onScan = async (barcodeRaw) => {
  const barcode = cleanBarcode(barcodeRaw)
  if (!barcode || !selectedOp) return

  try {
    const supply = await lookupBarcode(barcode)
    const qty = scanMode === 'fast' ? 1 : quantity
    const match = opSupplies.find((s) => s.supply_id === supply.id)
    const availableQty = match ? match.quantity : 0

    if (availableQty < qty) {
      enqueueSnackbar(
        `❌ Not enough stock: Only ${availableQty} ${supply.unit || ''} available in Op for ${supply.name}`,
        { variant: 'error' }
      )
      return
    }

    await consumeSupply({ supply_id: supply.id, quantity: qty, op_id: selectedOp })

    enqueueSnackbar(`✓ Consumed ${qty} ${supply.name}`, {
      variant: 'success',
      action: () => (
        <Button
          onClick={async () => {
            await checkInSupply({ supply_id: supply.id, quantity: qty, op_id: selectedOp })
            enqueueSnackbar(`✓ Undid consumption of ${qty} ${supply.name}`, { variant: 'info' })
            if (onSupplyChange) onSupplyChange()
            await refreshOpSupplies() // ✅ Undo reflects immediately too
          }}
          color="inherit"
          size="small"
        >
          Undo
        </Button>
      ),
    })

    if (onSupplyChange) onSupplyChange()
    await refreshOpSupplies() // ✅ Refresh operatory view after consumption
  } catch (err) {
    const status = err.response?.status
    const message = err.response?.data?.error || 'Unknown error'

    if (status === 404) {
      setBarcodeToHandle(barcode)
      setModalType('notFound')
    } else if (status === 400) {
      enqueueSnackbar(`❌ ${message}`, { variant: 'error' })
    } else {
      enqueueSnackbar('❌ Something went wrong during consumption.', { variant: 'error' })
      console.error('Scan consume error:', err)
    }
  }
}


  const handleAssign = async () => {
    await assignBarcodeToSupply(assignSupplyId, barcodeToHandle)
    enqueueSnackbar(`✓ Assigned barcode to supply`, { variant: 'success' })
    setModalType(null)
    if (onSupplyChange) onSupplyChange()
  }

  const handleCreate = async () => {
    await createSupplyWithBarcode({
      user_id: user.id,
      name: newSupplyName,
      category_id: null,
      supplier_id: null,
      quantity: 0,
      cost_per_unit: 0,
      unit: newSupplyUnit,
      low_stock_threshold: 0,
      barcode: barcodeToHandle,
    })
    enqueueSnackbar(`✓ Created new supply: ${newSupplyName}`, { variant: 'success' })
    setModalType(null)
    if (onSupplyChange) onSupplyChange()
  }

  useBarcodeScanner(step === 2 ? onScan : () => {})

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Scan to Consume</DialogTitle>
        <DialogContent>
          {step === 1 && (
            <FormControl fullWidth>
              <InputLabel>Operatory</InputLabel>
              <Select value={selectedOp} onChange={(e) => setSelectedOp(e.target.value)}>
                {operatories.map((op) => (
                  <MenuItem key={op.id} value={op.id}>{op.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {step === 2 && (
            <>
              <Typography>Select scanning mode:</Typography>
              <RadioGroup value={scanMode} onChange={(e) => setScanMode(e.target.value)}>
                <FormControlLabel value="fast" control={<Radio />} label="Fast Scan (Subtracts -1 unit per scan)" />
                <FormControlLabel value="quantity" control={<Radio />} label="Select quantity, then scan" />
              </RadioGroup>
              {scanMode === 'quantity' && (
                <Box mt={2}>
                  <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
                </Box>
              )}
              <Paper
  elevation={3}
  sx={{
    mt: 4,
    p: 3,
    textAlign: 'center',
    backgroundColor: '#e3f2fd', // Light blue
    border: '2px dashed #1976d2',
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    letterSpacing: '0.5px',
  }}
>
  📷 Scan a barcode now…
</Paper>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 2 && <Button onClick={() => setStep(step + 1)} disabled={!selectedOp}>Next</Button>}
          {step === 2 && <Button onClick={onClose}>Close</Button>}
        </DialogActions>
      </Dialog>

      <Dialog open={modalType === 'notFound'} onClose={() => setModalType(null)}>
        <DialogTitle>Barcode Not Found</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            The scanned barcode does not match any supply. What would you like to do?
          </Typography>
          <Button variant="contained" onClick={() => setModalType('assign')} sx={{ mt: 1, mb: 1 }}>
            Assign to Existing Supply
          </Button>
          <Button variant="outlined" onClick={() => setModalType('create')}>
            Create New Supply
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === 'assign'} onClose={() => setModalType(null)}>
        <DialogTitle>Assign Barcode</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Supply</InputLabel>
            <Select
              value={assignSupplyId}
              onChange={(e) => setAssignSupplyId(e.target.value)}
              label="Select Supply"
            >
              {supplies.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssign} disabled={!assignSupplyId}>Assign</Button>
          <Button onClick={() => setModalType(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalType === 'create'} onClose={() => setModalType(null)}>
        <DialogTitle>Create New Supply</DialogTitle>
        <DialogContent>
          <TextField
            label="Supply Name"
            value={newSupplyName}
            onChange={(e) => setNewSupplyName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Unit (e.g. box, pack)"
            value={newSupplyUnit}
            onChange={(e) => setNewSupplyUnit(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreate} disabled={!newSupplyName || !newSupplyUnit}>Create</Button>
          <Button onClick={() => setModalType(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
