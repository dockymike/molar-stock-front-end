// ✅ FINAL FIXED ScanCheckInModal.jsx
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
  Autocomplete,
  Paper, // ✅ Add this here

} from '@mui/material'
import { useEffect, useState } from 'react'
import { useSnackbar } from 'notistack'
import useBarcodeScanner from '../hooks/useBarcodeScanner'
import {
  lookupBarcode,
  assignBarcodeToSupply,
  createSupplyWithBarcode,
  checkInSupply,
} from '../services/BarcodeService'
import { fetchSupplies } from '../../services/SuppliesService'
import { fetchOperatories } from '../../services/OperatoryListService'
import QuantitySelector from './QuantitySelector'
import { cleanBarcode } from '../utils/barcodeParser'

export default function ScanCheckInModal({ open, onClose, user, onSupplyChange }) {
  const { enqueueSnackbar } = useSnackbar()
  const [destination, setDestination] = useState('supplies') // default = unassigned
  const [selectedOp, setSelectedOp] = useState('')
  const [scanMode, setScanMode] = useState('fast')
  const [quantity, setQuantity] = useState(1)
  const [operatories, setOperatories] = useState([])
  const [supplies, setSupplies] = useState([])
  const [modalType, setModalType] = useState(null)
  const [barcodeToHandle, setBarcodeToHandle] = useState('')
  const [assignSupplyId, setAssignSupplyId] = useState('')
  const [newSupplyName, setNewSupplyName] = useState('')
  const [newSupplyUnit, setNewSupplyUnit] = useState('')

  useEffect(() => {
    if (open && user?.id) {
      const token = localStorage.getItem('token')
      fetchOperatories(user.id).then(setOperatories)
      fetchSupplies(user.id, token).then(setSupplies)
    }
  }, [open, user])

  useEffect(() => {
    if (!open) {
      setDestination('supplies')
      setSelectedOp('')
      setScanMode('fast')
      setQuantity(1)
      setModalType(null)
    }
  }, [open])

  const onScan = async (barcode) => {
    const cleaned = cleanBarcode(barcode)
    if (!cleaned) return

    try {
      const supply = await lookupBarcode(cleaned)
      const qty = scanMode === 'fast' ? 1 : quantity

      if (destination === 'supplies') {
        await checkInSupply({ supply_id: supply.id, quantity: qty, op_id: null })
        enqueueSnackbar(`✓ Checked in ${qty} ${supply.name} to Unassigned`, {
          variant: 'success',
          action: () => (
            <Button
              onClick={async () => {
                await checkInSupply({ supply_id: supply.id, quantity: -qty, op_id: null })
                enqueueSnackbar(`✓ Undid check-in`, { variant: 'info' })
                if (onSupplyChange) onSupplyChange()
              }}
              color="inherit"
              size="small"
            >
              Undo
            </Button>
          ),
        })
      } else if (destination === 'op') {
        if (!selectedOp) return enqueueSnackbar('❗ Select an operatory.', { variant: 'warning' })

        await checkInSupply({ supply_id: supply.id, quantity: qty, op_id: selectedOp })
        enqueueSnackbar(`✓ Checked in ${qty} ${supply.name} to Operatory`, {
          variant: 'success',
          action: () => (
            <Button
              onClick={async () => {
                await checkInSupply({ supply_id: supply.id, quantity: -qty, op_id: selectedOp })
                enqueueSnackbar(`✓ Undid check-in`, { variant: 'info' })
                if (onSupplyChange) onSupplyChange()
              }}
              color="inherit"
              size="small"
            >
              Undo
            </Button>
          ),
        })
      } else if (destination === 'transfer') {
        if (!selectedOp) return enqueueSnackbar('❗ Select an operatory.', { variant: 'warning' })

        await checkInSupply({ supply_id: supply.id, quantity: -qty, op_id: null })
        await checkInSupply({ supply_id: supply.id, quantity: qty, op_id: selectedOp })
        enqueueSnackbar(`✓ Moved ${qty} ${supply.name} from Unassigned → Operatory`, {
          variant: 'success',
          action: () => (
            <Button
              onClick={async () => {
                await checkInSupply({ supply_id: supply.id, quantity: qty, op_id: null })
                await checkInSupply({ supply_id: supply.id, quantity: -qty, op_id: selectedOp })
                enqueueSnackbar(`✓ Undid transfer`, { variant: 'info' })
                if (onSupplyChange) onSupplyChange()
              }}
              color="inherit"
              size="small"
            >
              Undo
            </Button>
          ),
        })
      }

      if (onSupplyChange) onSupplyChange()
    } catch (err) {
      if (err.response?.status === 404) {
        setBarcodeToHandle(cleaned)
        setModalType('notFound')
      } else {
        enqueueSnackbar(err.response?.data?.error || 'Unknown error', { variant: 'error' })

      }
    }
  }

  const handleAssign = async () => {
    await assignBarcodeToSupply(assignSupplyId, barcodeToHandle)
    enqueueSnackbar('✓ Assigned barcode to supply', { variant: 'success' })
    setModalType(null)
    if (onSupplyChange) onSupplyChange()
  }

  const handleCreate = async () => {
    const newSupply = await createSupplyWithBarcode({
      user_id: user.id,
      name: newSupplyName,
      unit: newSupplyUnit,
      quantity: 0,
      barcode: barcodeToHandle,
      category_id: null,
      supplier_id: null,
      cost_per_unit: 0,
      low_stock_threshold: 0,
    })

    await checkInSupply({ supply_id: newSupply.id, quantity: 1, op_id: null })
    enqueueSnackbar(`✓ Created and added 1 ${newSupply.name} to Unassigned`, { variant: 'success' })
    setModalType(null)
    if (onSupplyChange) onSupplyChange()
  }

  useBarcodeScanner(open ? onScan : () => {})

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Scan to Check-In</DialogTitle>
        <DialogContent>
          <Typography>Select destination:</Typography>
          <RadioGroup value={destination} onChange={(e) => setDestination(e.target.value)}>
            <FormControlLabel
              value="supplies"
              control={<Radio />}
              label="Add to Unassigned Inventory"
            />
            <FormControlLabel
              value="op"
              control={<Radio />}
              label="Add Directly to Operatory"
            />
            <FormControlLabel
              value="transfer"
              control={<Radio />}
              label="Trasnfer from Unassigned Inventory to an Operatory"
            />
          </RadioGroup>

          {(destination === 'op' || destination === 'transfer') && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Operatory</InputLabel>
              <Select value={selectedOp} onChange={(e) => setSelectedOp(e.target.value)}>
                {operatories.map((op) => (
                  <MenuItem key={op.id} value={op.id}>
                    {op.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box mt={3}>
            <Typography>Select scan mode:</Typography>
            <RadioGroup value={scanMode} onChange={(e) => setScanMode(e.target.value)}>
              <FormControlLabel value="fast" control={<Radio />} label="Fast Scan (+1 each scan)" />
              <FormControlLabel value="quantity" control={<Radio />} label="Specify Quantity" />
            </RadioGroup>
            {scanMode === 'quantity' && (
              <Box mt={2}>
                <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
              </Box>
            )}
          </Box>

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
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Not Found Modal */}
      <Dialog open={modalType === 'notFound'} onClose={() => setModalType(null)}>
        <DialogTitle>Barcode Not Found</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            This barcode does not match any supply. What would you like to do?
          </Typography>
          <Button variant="contained" onClick={() => setModalType('assign')} sx={{ mt: 1, mb: 1 }}>
            Assign to Existing Supply
          </Button>
          <Button variant="outlined" onClick={() => setModalType('create')}>
            Create New Supply
          </Button>
        </DialogContent>
      </Dialog>

      {/* Assign Modal */}
      <Dialog open={modalType === 'assign'} onClose={() => setModalType(null)} fullWidth maxWidth="md">
        <DialogTitle>Assign Barcode</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={supplies}
            getOptionLabel={(option) => option.name}
            value={supplies.find((s) => s.id === assignSupplyId) || null}
            onChange={(e, newValue) => setAssignSupplyId(newValue?.id || '')}
            renderInput={(params) => <TextField {...params} label="Search Supply" margin="normal" fullWidth />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssign} disabled={!assignSupplyId}>Assign</Button>
          <Button onClick={() => setModalType(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={modalType === 'create'} onClose={() => setModalType(null)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Supply</DialogTitle>
        <DialogContent>
          <TextField
            label="Supply Name"
            value={newSupplyName}
            onChange={(e) => setNewSupplyName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Unit</InputLabel>
            <Select
              value={newSupplyUnit}
              onChange={(e) => setNewSupplyUnit(e.target.value)}
              label="Unit"
            >
              <MenuItem value="piece">Piece(s)</MenuItem>
              <MenuItem value="box">Box(es)</MenuItem>
              <MenuItem value="container">Container(s)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreate} disabled={!newSupplyName || !newSupplyUnit}>Create</Button>
          <Button onClick={() => setModalType(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
