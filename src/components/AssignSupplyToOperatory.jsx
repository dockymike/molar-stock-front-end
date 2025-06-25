// ✅ DEBUG LOGGED AssignSupplyToOperatory.jsx
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material'
import { fetchOperatories } from '../services/OperatoryListService'
import { fetchSupplies } from '../services/SuppliesService'
import {
  assignSupplyToOperatory,
  fetchAssignedQuantity,
} from '../services/OpSuppliesService'

export default function AssignSupplyToOperatory({ onSupplyChange }) {
  const [ops, setOps] = useState([])
  const [supplies, setSupplies] = useState([])
  const [selectedOps, setSelectedOps] = useState([])
  const [selectedSupply, setSelectedSupply] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState({ open: false, message: '' })

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const loadData = async () => {
    try {
      const [opsData, suppliesData] = await Promise.all([
        fetchOperatories(user.id),
        fetchSupplies(user.id, token),
      ])
      console.log('✅ Loaded Operatories:', opsData)
      console.log('✅ Loaded Supplies:', suppliesData)
      setOps(opsData)
      setSupplies(suppliesData)
    } catch (err) {
      console.error('❌ Failed to load data:', err)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadData()
  }, [user?.id])

  const handleAssign = async () => {
    console.log('--- 🟡 Starting Assignment ---')
    console.log('📦 Selected Supply ID:', selectedSupply)
    console.log('🦷 Selected Ops:', selectedOps)
    console.log('🔢 Quantity per op:', quantity)

    if (selectedOps.length === 0 || !selectedSupply) {
      console.warn('⚠️ Must select at least one operatory and a supply.')
      return
    }

    const supply = supplies.find((s) => s.id === selectedSupply)
    if (!supply) {
      console.warn('⚠️ Supply not found in loaded list.')
      return
    }

    const totalRequested = selectedOps.length * Number(quantity)
    const unassigned = supply.quantity
    console.log(`📊 Total Requested: ${totalRequested}, Unassigned Available: ${unassigned}`)

    if (totalRequested > unassigned) {
      alert(`❌ Not enough unassigned stock. Only ${unassigned} available.`)
      return
    }

    for (const opId of selectedOps) {
      try {
        console.log(`✅ Assigning ${quantity} of supply ${selectedSupply} to op ${opId}`)
        await assignSupplyToOperatory({
          op_id: opId,
          supply_id: selectedSupply,
          quantity: Number(quantity),
        })
      } catch (err) {
        console.error(`❌ Failed assigning to op ${opId}:`, err.message)
      }
    }

    console.log('✅ Assignment complete. Refreshing data...')
    setSelectedOps([])
    setSelectedSupply('')
    setQuantity(1)
    setToast({ open: true, message: 'Supply assigned successfully' })
    await loadData()
    if (onSupplyChange) onSupplyChange()
  }

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Assign Supply to Operatories
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Operatories</InputLabel>
        <Select
          multiple
          value={selectedOps}
          onChange={(e) => setSelectedOps(e.target.value)}
        >
          {ops.map((op) => (
            <MenuItem key={op.id} value={op.id}>
              {op.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Supply</InputLabel>
        <Select
          value={selectedSupply}
          onChange={(e) => setSelectedSupply(e.target.value)}
        >
          {supplies.map((supply) => (
            <MenuItem key={supply.id} value={supply.id}>
              {supply.name} ({supply.quantity} unassigned)
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Quantity (per op)"
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        margin="normal"
      />

      <Button variant="contained" onClick={handleAssign}>
        Assign to Selected
      </Button>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ open: false, message: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ open: false, message: '' })}
          severity="success"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
