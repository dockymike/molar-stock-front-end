// ✅ ConsumeModal.jsx – Only subtracts from op_supplies
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  TextField,
  Autocomplete,
  Alert,
  Snackbar,
} from '@mui/material'
import { Add, Remove, Delete } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { fetchProcedures, fetchSuppliesForProcedure } from '../services/ProceduresService'
import { fetchOperatories } from '../services/OperatoryListService'
import { fetchOpSupplies } from '../services/OpSuppliesService'
import { logSupplyUse } from '../services/UsageLogService'

export default function ConsumeModal({ open, onClose, onSupplyChange }) {
  const user = JSON.parse(localStorage.getItem('user'))

  const [step, setStep] = useState(1)
  const [procedures, setProcedures] = useState([])
  const [ops, setOps] = useState([])
  const [selectedOp, setSelectedOp] = useState('')
  const [selectedProcedure, setSelectedProcedure] = useState('')
  const [opSupplies, setOpSupplies] = useState([])
  const [manualSupplies, setManualSupplies] = useState([])
  const [allOpSupplies, setAllOpSupplies] = useState([])
  const [quantities, setQuantities] = useState({})
  const [error, setError] = useState('')
  const [toast, setToast] = useState({ open: false, message: '' })

  useEffect(() => {
    if (user?.id) {
      fetchProcedures(user.id).then(setProcedures)
      fetchOperatories(user.id).then(setOps)
    }
  }, [user?.id])

  useEffect(() => {
    if (selectedOp) fetchOpSupplies(selectedOp).then(setAllOpSupplies)
  }, [selectedOp])

  useEffect(() => {
    const load = async () => {
      if (!selectedProcedure || !selectedOp || allOpSupplies.length === 0) return

      const procSupplies = await fetchSuppliesForProcedure(selectedProcedure)
      const matched = procSupplies.map((ps) => {
        const opSupply = allOpSupplies.find((op) => op.supply_id === ps.supply_id)
        return {
          supply_id: ps.supply_id,
          supply_name: ps.supply_name,
          unit: ps.unit || 'piece(s)',
          available: opSupply ? opSupply.quantity : 0,
          procedure_quantity: ps.procedure_quantity || 0,
        }
      })
      setOpSupplies(matched)

      const newQuantities = {}
      matched.forEach((s) => {
        newQuantities[s.supply_id] = s.available > 0 ? s.procedure_quantity : 0
      })
      setQuantities((prev) => ({ ...prev, ...newQuantities }))
    }
    load()
  }, [selectedProcedure, selectedOp, allOpSupplies])

  const handleQuantityChange = (supplyId, delta) => {
    const opSupply = allOpSupplies.find((s) => s.supply_id === supplyId)
    const available = opSupply ? opSupply.quantity : 0
    const newQty = Math.max(0, Math.min((quantities[supplyId] || 0) + delta, available))
    setQuantities((prev) => ({ ...prev, [supplyId]: newQty }))
  }

  const handleAddManualSupply = (supply) => {
    const exists = opSupplies.some((s) => s.supply_id === supply.supply_id) ||
                   manualSupplies.some((s) => s.supply_id === supply.supply_id)
    if (!exists) {
      const opSupply = allOpSupplies.find((s) => s.supply_id === supply.supply_id)
      const available = opSupply ? opSupply.quantity : 0
      setManualSupplies((prev) => [...prev, { ...supply, unit: supply.unit || 'piece(s)' }])
      setQuantities((prev) => ({ ...prev, [supply.supply_id]: available > 0 ? 1 : 0 }))
    }
  }

  const handleRemoveSupply = (supplyId) => {
    setQuantities((prev) => {
      const copy = { ...prev }
      delete copy[supplyId]
      return copy
    })
    setManualSupplies((prev) => prev.filter((s) => s.supply_id !== supplyId))
    setOpSupplies((prev) => prev.filter((s) => s.supply_id !== supplyId))
  }

  const handleSubmit = async () => {
    const overused = Object.entries(quantities).filter(([id, qty]) => {
      const available = allOpSupplies.find((s) => s.supply_id === Number(id))?.quantity || 0
      return qty > available
    })
    if (overused.length > 0) {
      setError('One or more supplies exceed available quantity in this operatory.')
      return
    }

    const logs = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([supply_id, quantity]) => ({
        user_id: user.id,
        op_id: selectedOp,
        supply_id: Number(supply_id),
        quantity,
        action: 'use',
        procedure_id: selectedProcedure || null,
      }))

    try {
      for (const log of logs) await logSupplyUse(log)
      setToast({ open: true, message: 'Supplies logged successfully' })
      if (onSupplyChange) onSupplyChange()
      setTimeout(() => {
        onClose()
        setStep(1)
        setSelectedOp('')
        setSelectedProcedure('')
        setOpSupplies([])
        setManualSupplies([])
        setQuantities({})
        setError('')
      }, 500)
    } catch (err) {
      console.error('❌ Log error:', err)
      setError('Failed to log some supplies.')
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Consume Supplies</DialogTitle>
        <DialogContent>
          {step === 1 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Operatory</InputLabel>
              <Select
                value={selectedOp}
                onChange={(e) => setSelectedOp(e.target.value)}
                label="Select Operatory"
              >
                {ops.map((op) => (
                  <MenuItem key={op.id} value={op.id}>{op.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {step === 2 && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Procedure (optional)</InputLabel>
                <Select
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                >
                  {procedures.map((proc) => (
                    <MenuItem key={proc.id} value={proc.id}>{proc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                options={allOpSupplies}
                getOptionLabel={(s) => s.supply_name || ''}
                onChange={(_, value) => value && handleAddManualSupply(value)}
                renderInput={(params) => <TextField {...params} label="Add Supply Manually" margin="normal" />}
              />

              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

              <Typography mt={2} variant="subtitle1">Selected Supplies:</Typography>
              {[...opSupplies, ...manualSupplies].map((supply) => {
                const qty = quantities[supply.supply_id] || 0
                const available = allOpSupplies.find((s) => s.supply_id === supply.supply_id)?.quantity || 0
                const unit = supply.unit || 'piece(s)'

                return (
                  <Box key={supply.supply_id} display="flex" justifyContent="space-between" alignItems="center" my={1}>
                    <Box>
                      <Typography>{supply.supply_name} ({unit})</Typography>
                      {available === 0 && (
                        <Typography variant="caption" color="error">
                          0 available in this operatory
                        </Typography>
                      )}
                    </Box>
                    <Box display="flex" alignItems="center">
                      <IconButton onClick={() => handleQuantityChange(supply.supply_id, -1)}><Remove /></IconButton>
                      <Typography mx={1}>{qty}</Typography>
                      <IconButton onClick={() => handleQuantityChange(supply.supply_id, 1)} disabled={qty >= available}><Add /></IconButton>
                      <IconButton onClick={() => handleRemoveSupply(supply.supply_id)}><Delete /></IconButton>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {step === 1 ? (
            <Button variant="contained" disabled={!selectedOp} onClick={() => setStep(2)}>Next</Button>
          ) : (
            <>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={!selectedOp}>Submit</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ open: false, message: '' })} severity="success" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  )
}
