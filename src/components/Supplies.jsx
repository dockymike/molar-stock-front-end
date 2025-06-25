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
  Tooltip,
  Chip,
  Divider,
  Snackbar,
  Alert,
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

export default function Supplies({ onSupplyChange, refreshKey }) {
  const [supplies, setSupplies] = useState([])
  const [assignedMap, setAssignedMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const [newName, setNewName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [unit, setUnit] = useState('piece')
  const [lowStockThreshold, setLowStockThreshold] = useState('')

  const [editingSupply, setEditingSupply] = useState(null)

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const loadAll = async () => {
    try {
      setLoading(true)
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
        } catch {
          assigned[supply.id] = []
        }
      }
      setAssignedMap(assigned)
    } catch (err) {
      console.error('❌ Failed loading supplies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadAll()
  }, [user?.id, token, refreshKey])

  const filtered = supplies.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddNewSupply = async () => {
    if (!newName.trim()) return

    const data = {
      user_id: user.id,
      name: newName,
      category_id: categoryId || null,
      supplier_id: supplierId || null,
      quantity: quantity || 0,
      cost_per_unit: costPerUnit || null,
      unit: unit || 'piece',
      low_stock_threshold: lowStockThreshold || 0,
    }

    try {
      const newSupply = await addSupply(data)
      setSupplies((prev) => [newSupply, ...prev])
      if (onSupplyChange) onSupplyChange()

      setNewName('')
      setCategoryId('')
      setSupplierId('')
      setQuantity('')
      setCostPerUnit('')
      setUnit('piece')
      setLowStockThreshold('')
      setShowAddForm(false)
      setToast({ open: true, message: 'Supply added successfully!', severity: 'success' })
    } catch (err) {
      console.error('❌ Add supply failed:', err)
    }
  }

  const handleEditSupply = async () => {
    if (!editingSupply) return
    try {
      await updateSupply(editingSupply.id, editingSupply)
      for (const op of editingSupply.assigned_quantities || []) {
        await updateOpSupplyQuantity(editingSupply.id, op.op_id, op.quantity)
      }
      setToast({ open: true, message: 'Supply updated!', severity: 'success' })
      setEditingSupply(null)
      loadAll()
    } catch (err) {
      console.error('❌ Update supply failed:', err)
    }
  }

    const openEditModal = (supply) => {
    setEditingSupply({
      ...supply,
      assigned_quantities: assignedMap[supply.id]?.map((op) => ({
        op_name: op.op_name,
        op_id: op.op_id,
        quantity: op.quantity,
      })) || [],
    })
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-start" mb={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? 'Cancel' : 'Add New'}
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Supplies
      </Typography>

      {showAddForm && (
        <Box display="flex" flexDirection="column" gap={2} my={2}>
          <TextField label="Supply Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} label="Category">
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Supplier</InputLabel>
            <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} label="Supplier">
              {suppliers.map((sup) => (
                <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <TextField label="Low Stock Threshold" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} />
          <TextField label="Cost per Unit" type="number" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select value={unit} onChange={(e) => setUnit(e.target.value)} label="Unit">
              <MenuItem value="piece">Piece(s)</MenuItem>
              <MenuItem value="box">Box(es)</MenuItem>
              <MenuItem value="container">Container(s)</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAddNewSupply}>Add Supply</Button>
        </Box>
      )}

      <TextField
        label="Search Supplies"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ mb: 3 }}
      />

      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <CircularProgress />
      ) : filtered.length === 0 ? (
        <Typography>No supplies found.</Typography>
      ) : (
        filtered.map((supply) => {
          const assignedList = assignedMap[supply.id] || []
          const assigned = assignedList.reduce((sum, e) => sum + (e.quantity || 0), 0)
          const unassigned = supply.quantity || 0
          const total = assigned + unassigned

          return (
  <Paper key={supply.id} sx={{ p: 2, mb: 2 }}>
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      <IconButton onClick={() => setEditingSupply(supply)}><EditIcon /></IconButton>
      <IconButton color="error"><DeleteIcon /></IconButton>
      <Typography fontWeight="bold">{supply.name}</Typography>

      <Chip label={`Unassigned: ${unassigned}`} color="primary" />

<Chip
  label={`Low Stock Threshold: ${supply.low_stock_threshold || 0}`}
  color={
    (supply.quantity || 0) <= (supply.low_stock_threshold || 0)
      ? 'error'
      : 'default'
  }
  variant="outlined"
/>

<Tooltip
  title={
    <Box>
      {assignedList.map((a, i) => (
        <Typography key={i}>{a.op_name}: {a.quantity}</Typography>
      ))}
    </Box>
  }
  arrow
>
  <Chip label={`Assigned: ${assigned}`} color="secondary" />
</Tooltip>

<Chip
  label={`Category: ${
    categories.find((cat) => cat.id === supply.category_id)?.name || 'Unassigned'
  }`}
  variant="outlined"
/>

<Chip
  label={`Supplier: ${
    suppliers.find((sup) => sup.id === supply.supplier_id)?.name || 'Unassigned'
  }`}
  variant="outlined"
/>

<Chip label={`Unit: ${supply.unit}`} variant="outlined" />
<Chip label={`Cost: $${Number(supply.cost_per_unit || 0).toFixed(2)}`} variant="outlined" />
<Chip label={`Barcode: ${supply.barcode || 'None'}`} variant="outlined" />
    </Box>
  </Paper>
)

        })
      )}

      <Dialog open={!!editingSupply} onClose={() => setEditingSupply(null)} maxWidth="sm" fullWidth>
  <DialogTitle>Edit Supply</DialogTitle>
  <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  <TextField
    label="Supply Name"
    value={editingSupply?.name || ''}
    onChange={(e) =>
      setEditingSupply((prev) => ({ ...prev, name: e.target.value }))
    }
  />

  <FormControl fullWidth>
    <InputLabel>Category</InputLabel>
    <Select
      value={editingSupply?.category_id || ''}
      onChange={(e) =>
        setEditingSupply((prev) => ({
          ...prev,
          category_id: e.target.value,
        }))
      }
    >
      {categories.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>
          {cat.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl fullWidth>
    <InputLabel>Supplier</InputLabel>
    <Select
      value={editingSupply?.supplier_id || ''}
      onChange={(e) =>
        setEditingSupply((prev) => ({
          ...prev,
          supplier_id: e.target.value,
        }))
      }
    >
      {suppliers.map((sup) => (
        <MenuItem key={sup.id} value={sup.id}>
          {sup.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <TextField
    label="Quantity"
    type="number"
    value={editingSupply?.quantity || ''}
    onChange={(e) =>
      setEditingSupply((prev) => ({ ...prev, quantity: e.target.value }))
    }
  />

  <TextField
    label="Low Stock Threshold"
    type="number"
    value={editingSupply?.low_stock_threshold || ''}
    onChange={(e) =>
      setEditingSupply((prev) => ({
        ...prev,
        low_stock_threshold: e.target.value,
      }))
    }
  />

  <TextField
    label="Cost per Unit"
    type="number"
    value={editingSupply?.cost_per_unit || ''}
    onChange={(e) =>
      setEditingSupply((prev) => ({
        ...prev,
        cost_per_unit: e.target.value,
      }))
    }
  />

  <FormControl fullWidth>
    <InputLabel>Unit</InputLabel>
    <Select
      value={editingSupply?.unit || 'piece'}
      onChange={(e) =>
        setEditingSupply((prev) => ({ ...prev, unit: e.target.value }))
      }
    >
      <MenuItem value="piece">Piece(s)</MenuItem>
      <MenuItem value="box">Box(es)</MenuItem>
      <MenuItem value="container">Container(s)</MenuItem>
    </Select>
  </FormControl>

  <TextField
    label="Barcode"
    value={editingSupply?.barcode || ''}
    onChange={(e) =>
      setEditingSupply((prev) => ({ ...prev, barcode: e.target.value }))
    }
  />

  {editingSupply?.assigned_quantities?.length > 0 && (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold">
        Assigned Operatories
      </Typography>
      <Box display="flex" flexDirection="column" gap={1} mt={1}>
        {editingSupply.assigned_quantities.map((op, idx) => (
          <Box key={idx} display="flex" alignItems="center" gap={2}>
            <Typography width="100px">{op.op_name}</Typography>
            <TextField
              type="number"
              size="small"
              value={op.quantity}
              onChange={(e) => {
                const value = e.target.value
                setEditingSupply((prev) => {
                  const updated = [...prev.assigned_quantities]
                  updated[idx] = { ...updated[idx], quantity: value }
                  return { ...prev, assigned_quantities: updated }
                })
              }}
              sx={{ width: '100px' }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  )}
</DialogContent>


  <DialogActions>
    <Button onClick={() => setEditingSupply(null)}>Cancel</Button>
    <Button onClick={handleEditSupply} variant="contained" startIcon={<SaveIcon />}>
      Save
    </Button>
  </DialogActions>
</Dialog>



      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}