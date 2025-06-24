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
  const [unassignedMap, setUnassignedMap] = useState({})
  const [toast, setToast] = useState({ open: false, message: '' })

  const user = JSON.parse(localStorage.getItem('user'))

  const loadData = async () => {
    console.log('🔄 Fetching operatories and supplies for user:', user.id)

    try {
      const [opsData, suppliesData] = await Promise.all([
        fetchOperatories(user.id),
        fetchSupplies(user.id, localStorage.getItem('token')),
      ])

      setOps(opsData)
      console.log('✅ Operatories loaded:', opsData)
      console.log('✅ Supplies loaded (raw):', suppliesData)

      const enriched = await Promise.all(
        suppliesData.map(async (supply) => {
          const assigned = await fetchAssignedQuantity(supply.id)
          const unassigned = Math.max(0, supply.quantity - assigned)

          console.log(`🧮 Supply: ${supply.name}`)
          console.log(`   - Global Quantity: ${supply.quantity}`)
          console.log(`   - Assigned Total: ${assigned}`)
          console.log(`   - Calculated Unassigned: ${unassigned}`)

          return { ...supply, assigned, unassigned }
        })
      )

      const unassignedQtyMap = {}
      enriched.forEach((s) => {
        unassignedQtyMap[s.id] = s.unassigned
      })

      console.log('📊 Final Enriched Supplies:', enriched)
      console.log('📦 Unassigned Map:', unassignedQtyMap)

      setSupplies(enriched)
      setUnassignedMap(unassignedQtyMap)
    } catch (err) {
      console.error('❌ Failed to load operatories or supplies:', err)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadData()
  }, [user?.id])

  const handleAssign = async () => {
    if (selectedOps.length === 0 || !selectedSupply) return

    const unassigned = unassignedMap[selectedSupply] || 0
    const totalRequested = selectedOps.length * Number(quantity)

    console.log('📋 Submitting assignment:')
    console.log('   - Selected Ops:', selectedOps)
    console.log('   - Selected Supply:', selectedSupply)
    console.log('   - Quantity per Op:', quantity)
    console.log('   - Total Requested:', totalRequested)
    console.log('   - Unassigned Available:', unassigned)

    if (totalRequested > unassigned) {
      alert(`Not enough stock. Only ${unassigned} units unassigned.`)
      return
    }

    for (const opId of selectedOps) {
      try {
        await assignSupplyToOperatory({
          op_id: opId,
          supply_id: selectedSupply,
          quantity: Number(quantity),
        })
        console.log(`✅ Assigned ${quantity} to Operatory ID: ${opId}`)
      } catch (err) {
        console.error(`❌ Failed assigning to op ${opId}:`, err.message)
      }
    }

    setSelectedOps([])
    setSelectedSupply('')
    setQuantity(1)
    setToast({ open: true, message: 'Supply assigned successfully' })
    await loadData()

    if (onSupplyChange) {
      console.log('🔁 Triggering onSupplyChange() from parent...')
      onSupplyChange()
    }
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
              {supply.name} ({supply.unassigned} available)
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
