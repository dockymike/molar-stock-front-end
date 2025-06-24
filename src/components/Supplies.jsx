// ✅ Final Supplies.jsx – Updated with Edit/Delete Left + Full Modal
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Snackbar,
  Tooltip,
  Alert,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'

import {
  fetchSupplies,
  addSupply,
  updateSupply,
  deleteSupply,
  fetchAssignedBreakdown,
} from '../services/SuppliesService'

import { fetchCategories } from '../services/CategoriesService'
import { fetchSuppliers } from '../services/SuppliersService'
import { updateOpSupplyQuantity } from '../services/OpSuppliesService'

export default function Supplies({ onSupplyChange }) {
  const [supplies, setSupplies] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editedSupply, setEditedSupply] = useState({})
  const [assignedMap, setAssignedMap] = useState({})
  const [toast, setToast] = useState({ open: false, message: '' })
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [unit, setUnit] = useState('piece')
  const [lowStockThreshold, setLowStockThreshold] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!user?.id) return

    const loadAll = async () => {
      try {
        const [suppliesData, categoriesData, suppliersData] = await Promise.all([
          fetchSupplies(user.id, token),
          fetchCategories(user.id),
          fetchSuppliers(user.id, token),
        ])

        setSupplies(suppliesData)
        setCategories(categoriesData)
        setSuppliers(suppliersData)

        const assigned = {}
        for (const supply of suppliesData) {
          try {
            const ops = await fetchAssignedBreakdown(supply.id)
            assigned[supply.id] = ops || []
          } catch (err) {
            assigned[supply.id] = []
          }
        }
        setAssignedMap(assigned)
      } catch (err) {
        console.error('❌ Failed loading supplies page data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [user?.id, token])

  const handleAdd = () => {
    if (!name.trim()) return

    const data = {
      user_id: user.id,
      name,
      category_id: categoryId || null,
      supplier_id: supplierId || null,
      quantity: quantity || null,
      cost_per_unit: costPerUnit || null,
      unit: unit || 'piece',
      low_stock_threshold: lowStockThreshold || 0,
    }

    addSupply(data)
      .then((newSupply) => {
        setSupplies((prev) => [newSupply, ...prev])
        setName('')
        setCategoryId('')
        setSupplierId('')
        setQuantity('')
        setCostPerUnit('')
        setUnit('piece')
        setLowStockThreshold('')
        if (onSupplyChange) onSupplyChange()
      })
      .catch((err) => {
        console.error('❌ Add supply failed:', err)
      })
  }

  const handleEdit = (supply) => {
    setEditingId(supply.id)
    const editable = { ...supply }
    const assigned = assignedMap[supply.id] || []
    for (const entry of assigned) {
      editable[`op_${entry.op_supply_id}`] = entry.quantity
    }
    setEditedSupply(editable)
  }

 const handleSave = async () => {
  try {
    const assignedEntries = assignedMap[editingId] || []
    const totalAssigned = assignedEntries.reduce((sum, entry) => {
      const newQty = parseInt(editedSupply[`op_${entry.op_supply_id}`] || 0, 10)
      return sum + newQty
    }, 0)

    const globalQty = parseInt(editedSupply.quantity || 0, 10)
    if (totalAssigned > globalQty) {
      alert(`Assigned total (${totalAssigned}) exceeds global quantity (${globalQty})`)
      return
    }

    await updateSupply(editingId, editedSupply)

    for (const entry of assignedEntries) {
      const newQty = parseInt(editedSupply[`op_${entry.op_supply_id}`], 10)
      if (!isNaN(newQty) && newQty !== entry.quantity) {
        try {
          await updateOpSupplyQuantity(entry.op_supply_id, newQty, token)
        } catch (err) {
          console.error(`❌ Failed to update op quantity for ${entry.op_supply_id}:`, err)
        }
      }
    }

    // 🔁 Refresh state from backend
    const refreshed = await fetchSupplies(user.id, token)
    setSupplies(refreshed)

    const newAssignedMap = {}
    for (const supply of refreshed) {
      try {
        const ops = await fetchAssignedBreakdown(supply.id)
        newAssignedMap[supply.id] = ops || []
      } catch (err) {
        newAssignedMap[supply.id] = []
      }
    }
    setAssignedMap(newAssignedMap)

    setEditingId(null)
    setEditedSupply({})
    setToast({ open: true, message: 'Supply saved successfully' })
    if (onSupplyChange) onSupplyChange()
  } catch (err) {
    console.error('❌ Update failed:', err)
  }
}

  const handleDelete = async (id) => {
    try {
      await deleteSupply(id)
      setSupplies((prev) => prev.filter((s) => s.id !== id))
      if (onSupplyChange) onSupplyChange()
    } catch (err) {
      console.error('❌ Delete failed:', err)
    }
  }

  const filteredSupplies = supplies.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const legendItems = [
    { label: 'Global Quantity', description: 'Total supply in the entire office, including supplies that have or have NOT been allocated to operatories.' },
    { label: 'Assigned', description: 'Amount already assigned to operatories.' },
    { label: 'Unassigned', description: 'Available to assign to operatories.' },
    { label: 'Low Stock', description: 'You’ll get an alert when this supply is running low globally — meaning there is not much left available in your office to assign to operatories.' },
  ]

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Global Supplies</Typography>

{/* Add Supply Form */}
<Box display="flex" flexDirection="column" gap={2} mb={4}>
  <TextField label="Supply Name" value={name} onChange={(e) => setName(e.target.value)} />

  <FormControl>
    <InputLabel>Category</InputLabel>
    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} label="Category">
      {categories.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
      ))}
    </Select>
  </FormControl>
  <Typography variant="body2" color="textSecondary" sx={{ ml: 1, mt: -1 }}>
    Create supply categories in the Categories tab.
  </Typography>

  <FormControl>
    <InputLabel>Supplier</InputLabel>
    <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} label="Supplier">
      {suppliers.map((sup) => (
        <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
      ))}
    </Select>
  </FormControl>
  <Typography variant="body2" color="textSecondary" sx={{ ml: 1, mt: -1 }}>
    Create suppliers in the Suppliers tab.
  </Typography>

  <TextField label="Global Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
  <Typography variant="body2" color="textSecondary" sx={{ ml: 1, mt: -1 }}>
    This is the amount of this supply you are adding to your global stock. You can then assign them to an operatory in the Send Supplies to Operatory tab after creating Operatories.
  </Typography>

  <TextField label="Low Stock Threshold" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
  <Typography variant="body2" color="textSecondary" sx={{ ml: 1, mt: -1 }}>
    If this supply reaches at or below this threshold, a low stock alert will be triggered. This threshold is for supply availability at a global level.
  </Typography>

  <TextField label="Cost per Unit" type="number" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />

  <FormControl>
    <InputLabel>Unit</InputLabel>
    <Select value={unit} onChange={(e) => setUnit(e.target.value)} label="Unit">
      <MenuItem value="piece">Piece(s)</MenuItem>
      <MenuItem value="box">Box(es)</MenuItem>
      <MenuItem value="container">Container(s)</MenuItem>
    </Select>
  </FormControl>

  <Button variant="contained" onClick={handleAdd}>Add</Button>

  <TextField
    label="Search Supplies"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search by name"
  />
</Box>

      {/* Legend */}
      <Divider sx={{ my: 3 }} />
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={4}>
        {legendItems.map((item) => (
          <Tooltip key={item.label} title={<Typography sx={{ fontSize: '14px' }}>{item.description}</Typography>} arrow>
            <Chip label={item.label} variant="outlined" />
          </Tooltip>
        ))}
      </Box>

      {loading ? (
        <CircularProgress />
      ) : filteredSupplies.length === 0 ? (
        <Typography>No supplies found.</Typography>
      ) : (
        filteredSupplies.map((supply) => {
          const assignedEntries = assignedMap[supply.id] || []
          const totalAssigned = assignedEntries.reduce((sum, s) => sum + (s.quantity || 0), 0)
          const unassigned = Math.max(0, (supply.quantity || 0) - totalAssigned)
          const totalValue = ((supply.quantity || 0) * (supply.cost_per_unit || 0)).toFixed(2)

          return (
            <Paper key={supply.id} sx={{ p: 2, mb: 2 }}>
  <Box
    display="flex"
    alignItems="center"
    flexWrap="nowrap"
    gap={1}
    overflow="auto"
    whiteSpace="nowrap"
    sx={{
      '&::-webkit-scrollbar': { display: 'none' },
      scrollbarWidth: 'none',
    }}
  >
    <IconButton onClick={() => handleEdit(supply)}><EditIcon /></IconButton>
    <IconButton color="error" onClick={() => handleDelete(supply.id)}><DeleteIcon /></IconButton>
    <Typography fontWeight="bold" sx={{ mr: 1 }}>{supply.name}</Typography>
    <Chip label={`Global: ${supply.quantity || 0}`} color="primary" />
    <Tooltip
  title={
    <Box>
      {assignedEntries.map((e, idx) => (
        <Typography key={idx} sx={{ fontSize: '16px', lineHeight: 1.5 }}>
          {e.op_name}: {e.quantity}
        </Typography>
      ))}
    </Box>
  }
  arrow
>
  <Chip label={`Assigned: ${totalAssigned}`} color="secondary" />
</Tooltip>
    <Chip label={`Unassigned: ${unassigned}`} />
    <Chip
  label={`Low Stock: ${supply.low_stock_threshold || 0}`}
  variant="outlined"
  color={(supply.quantity || 0) <= (supply.low_stock_threshold || 0) ? 'error' : 'default'}
  sx={(supply.quantity || 0) <= (supply.low_stock_threshold || 0) ? { borderColor: 'error.main', color: 'error.main' } : {}}
/>
    <Chip label={`Category: ${supply.category_name || 'None'}`} variant="outlined" />
    <Chip label={`Supplier: ${supply.supplier_name || 'None'}`} variant="outlined" />
    <Chip label={`Cost: $${supply.cost_per_unit || '-'} per ${supply.unit || 'piece'}`} variant="outlined" />
    <Chip label={`$${totalValue} Total`} variant="outlined" />
  </Box>
</Paper>

          )
        })
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingId} onClose={() => setEditingId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Supply</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={editedSupply.name || ''} onChange={(e) => setEditedSupply((prev) => ({ ...prev, name: e.target.value }))} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select value={editedSupply.category_id || ''} onChange={(e) => setEditedSupply((prev) => ({ ...prev, category_id: e.target.value }))}>
              {categories.map((cat) => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Supplier</InputLabel>
            <Select value={editedSupply.supplier_id || ''} onChange={(e) => setEditedSupply((prev) => ({ ...prev, supplier_id: e.target.value }))}>
              {suppliers.map((sup) => (<MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Global Quantity" type="number" value={editedSupply.quantity || ''} onChange={(e) => setEditedSupply((prev) => ({ ...prev, quantity: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Low Stock Threshold" type="number" value={editedSupply.low_stock_threshold || ''} onChange={(e) => setEditedSupply((prev) => ({ ...prev, low_stock_threshold: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Cost per Unit" type="number" value={editedSupply.cost_per_unit || ''} onChange={(e) => setEditedSupply((prev) => ({ ...prev, cost_per_unit: e.target.value }))} sx={{ mb: 2 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Unit</InputLabel>
            <Select value={editedSupply.unit || 'piece'} onChange={(e) => setEditedSupply((prev) => ({ ...prev, unit: e.target.value }))}>
              <MenuItem value="piece">Piece(s)</MenuItem>
              <MenuItem value="box">Box(es)</MenuItem>
              <MenuItem value="container">Container(s)</MenuItem>
            </Select>
          </FormControl>
          {assignedMap[editingId]?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Assigned Supplies</Typography>
              {assignedMap[editingId].map((entry) => (
                <TextField
                  key={`edit-${entry.op_supply_id}`}
                  fullWidth
                  label={`Quantity for ${entry.op_name}`}
                  type="number"
                  value={editedSupply[`op_${entry.op_supply_id}`] ?? entry.quantity}
                  onChange={(e) => setEditedSupply((prev) => ({ ...prev, [`op_${entry.op_supply_id}`]: e.target.value }))}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingId(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ open: false, message: '' })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setToast({ open: false, message: '' })} severity="success" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
