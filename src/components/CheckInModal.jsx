import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import { fetchSupplies, updateSupply, addSupply } from '../services/SuppliesService'
import { fetchCategories } from '../services/CategoriesService'
import { fetchSuppliers } from '../services/SuppliersService'

export default function CheckInModal({ open, onClose, onSupplyChange }) {
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const [supplies, setSupplies] = useState([])
  const [search, setSearch] = useState('')
  const [selectedSupply, setSelectedSupply] = useState(null)
  const [quantityToAdd, setQuantityToAdd] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const [showAddForm, setShowAddForm] = useState(false)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])

  const [newName, setNewName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [unit, setUnit] = useState('piece')
  const [lowStockThreshold, setLowStockThreshold] = useState('')

  useEffect(() => {
    if (!open || !user?.id || !token) return

    setLoading(true)
    fetchSupplies(user.id, token)
      .then(setSupplies)
      .finally(() => setLoading(false))

    fetchCategories(user.id).then(setCategories)
    fetchSuppliers(user.id, token).then(setSuppliers)
  }, [open])

  const handleSelectSupply = (supply) => {
    setSelectedSupply(supply)
    setQuantityToAdd('')
  }

  const handleCheckIn = async () => {
    if (!selectedSupply || !quantityToAdd || isNaN(quantityToAdd)) return
    if (parseInt(quantityToAdd) <= 0) {
      setToast({ open: true, message: 'Quantity must be greater than 0', severity: 'error' })
      return
    }

    setSaving(true)
    const newQuantity = selectedSupply.quantity + parseInt(quantityToAdd)
    try {
      await updateSupply(selectedSupply.id, {
        ...selectedSupply,
        quantity: newQuantity,
      })
      setSupplies((prev) =>
        prev.map((s) => (s.id === selectedSupply.id ? { ...s, quantity: newQuantity } : s))
      )
      setSelectedSupply(null)
      setQuantityToAdd('')
      setToast({ open: true, message: 'Supply checked in successfully', severity: 'success' })
      if (onSupplyChange) onSupplyChange()
    } catch (err) {
      console.error('❌ Check-in failed', err)
    } finally {
      setSaving(false)
    }
  }

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

      if (parseInt(quantity) > 0) {
        await updateSupply(newSupply.id, {
          ...newSupply,
          quantity: parseInt(quantity),
        })
      }

      setSupplies((prev) => [newSupply, ...prev])
      setToast({ open: true, message: 'Supply added and checked in!', severity: 'success' })
      if (onSupplyChange) onSupplyChange()

      setNewName('')
      setCategoryId('')
      setSupplierId('')
      setQuantity('')
      setCostPerUnit('')
      setUnit('piece')
      setLowStockThreshold('')
      setShowAddForm(false)
    } catch (err) {
      console.error('❌ Add/check-in supply failed:', err)
    }
  }

  const filteredSupplies = supplies.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Check-In Supplies
          <Button
            variant="outlined"
            size="small"
            sx={{ float: 'right', mt: '-5px' }}
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? 'Cancel' : 'Add New'}
          </Button>
        </DialogTitle>

        <DialogContent>
          {showAddForm ? (
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
              <Button variant="contained" onClick={handleAddNewSupply}>Check In</Button>
            </Box>
          ) : (
            <>
              <Box mb={2}>
                <TextField
                  fullWidth
                  placeholder="Search supplies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {loading ? (
                <Box textAlign="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                filteredSupplies.map((supply) => (
                  <Box
                    key={supply.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    borderBottom="1px solid #eee"
                    py={1}
                  >
                    <Box>
                      <Typography variant="subtitle1">{supply.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {supply.quantity} {supply.unit || ''} unassigned
                      </Typography>
                    </Box>
                    <Button variant="outlined" onClick={() => handleSelectSupply(supply)}>
                      Add
                    </Button>
                  </Box>
                ))
              )}

              {selectedSupply && (
                <Box mt={3}>
                  <Typography gutterBottom>
                    Add quantity to <strong>{selectedSupply.name}</strong>
                  </Typography>
                  <TextField
                    type="number"
                    label="Quantity to add"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {selectedSupply.unit || ''}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box textAlign="right" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleCheckIn}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Check In'}
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Close</Button>
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
    </>
  )
}
