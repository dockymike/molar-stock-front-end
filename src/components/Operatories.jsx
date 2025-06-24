import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Collapse,
  Chip,
  Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import {
  fetchOperatories,
  addOperatory,
  updateOperatory,
  deleteOperatory,
} from '../services/OperatoryListService'

import {
  fetchOpSupplies,
  updateOpSupplyQuantity,
  deleteOpSupply,
  fetchAssignedQuantity,
} from '../services/OpSuppliesService'

import { updateOperatoryLowStockThreshold } from '../services/LowStockService'

export default function Operatories({ onSupplyChange }) {
  const [ops, setOps] = useState([])
  const [opSupplies, setOpSupplies] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editedName, setEditedName] = useState('')
  const [editingSupply, setEditingSupply] = useState({})
  const [toast, setToast] = useState({ open: false, message: '' })

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!user?.id) return
    fetchOperatories(user.id)
      .then(async (data) => {
        setOps(data)
        const suppliesMap = {}
        for (const op of data) {
          const supplies = await fetchOpSupplies(op.id)
          suppliesMap[op.id] = supplies
        }
        setOpSupplies(suppliesMap)
        if (data.length > 0) setExpandedId(data[0].id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const handleAdd = () => {
    if (!name.trim()) return
    addOperatory({ user_id: user.id, name })
      .then((newOp) => {
        setOps((prev) => [newOp, ...prev])
        setName('')
      })
      .catch(console.error)
  }

  const handleEdit = (op) => {
    setEditingId(op.id)
    setEditedName(op.name)
  }

  const handleSave = async () => {
    const updated = await updateOperatory(editingId, { name: editedName })
    setOps((prev) => prev.map((op) => (op.id === editingId ? updated : op)))
    setEditingId(null)
    setEditedName('')
    setToast({ open: true, message: 'Operatory name saved successfully' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this operatory?')) return
    await deleteOperatory(id)
    setOps((prev) => prev.filter((op) => op.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  const handleSupplyEdit = (opId, supply) => {
    setEditingSupply({ ...supply, opId, low_stock_threshold: supply.low_stock_threshold || '' })
  }

  const handleSupplySave = async () => {
    const { id, quantity, opId, supply_id, low_stock_threshold } = editingSupply
    const parsedQty = parseInt(quantity)
    const parsedThreshold = parseInt(low_stock_threshold)

    if (isNaN(parsedQty) || parsedQty < 0) {
      alert('Quantity must be a valid non-negative number.')
      return
    }

    const totalAssigned = await fetchAssignedQuantity(supply_id)
    const globalQty = opSupplies[opId]?.find((s) => s.id === id)?.global_quantity || 0
    const currentOpQty = opSupplies[opId]?.find((s) => s.id === id)?.quantity || 0
    const available = globalQty - (totalAssigned - currentOpQty)

    if (parsedQty > available) {
      alert(`You can only assign up to ${available} units based on global stock.`)
      return
    }

    await updateOpSupplyQuantity(id, parsedQty, token)
    if (!isNaN(parsedThreshold)) {
      await updateOperatoryLowStockThreshold(id, parsedThreshold, token)
    }

    const updatedList = await fetchOpSupplies(opId)
    setOpSupplies((prev) => ({ ...prev, [opId]: updatedList }))
    setEditingSupply({})
    setToast({ open: true, message: 'Supply updated successfully' })
    if (onSupplyChange) onSupplyChange()
  }

  const handleSupplyDelete = async (id, opId) => {
    if (!window.confirm('Delete this supply from operatory?')) return
    await deleteOpSupply(id)
    const updatedList = await fetchOpSupplies(opId)
    setOpSupplies((prev) => ({ ...prev, [opId]: updatedList }))
  }

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const computeTotalAssignedPerSupply = () => {
    const totals = {}
    for (const opId in opSupplies) {
      for (const supply of opSupplies[opId]) {
        if (!totals[supply.supply_id]) totals[supply.supply_id] = 0
        totals[supply.supply_id] += supply.quantity || 0
      }
    }
    return totals
  }

  const totalAssignedMap = computeTotalAssignedPerSupply()

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Operatories</Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField label="Operatory Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button variant="contained" onClick={handleAdd}>Add</Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : ops.length === 0 ? (
        <Typography>No operatories found.</Typography>
      ) : (
        <List dense>
          {ops.map((op) => (
            <Paper key={op.id} sx={{ mb: 2 }}>
              <Box
                sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => toggleExpanded(op.id)}
              >
                <Box sx={{ flexGrow: 1 }}>
                  {editingId === op.id ? (
                    <TextField
                      value={editedName}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditedName(e.target.value)}
                      fullWidth
                    />
                  ) : (
                    <Typography variant="subtitle1">{op.name}</Typography>
                  )}
                </Box>

                <Box>
                  {expandedId === op.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  {editingId === op.id ? (
                    <IconButton onClick={(e) => { e.stopPropagation(); handleSave() }}><SaveIcon /></IconButton>
                  ) : (
                    <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(op) }}><EditIcon /></IconButton>
                  )}
                  <IconButton color="error" onClick={(e) => { e.stopPropagation(); handleDelete(op.id) }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={expandedId === op.id} timeout="auto" unmountOnExit>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" ml={2} mb={1}>
                  Assigned Supplies
                </Typography>

                {opSupplies[op.id]?.length > 0 ? (
                  <Box ml={2} mr={2}>
                    {opSupplies[op.id].map((supply) => {
                      const key = `${op.id}-${supply.id}`
                      const showWarning = supply.quantity <= (supply.low_stock_threshold || 0)
                      const totalAssigned = totalAssignedMap[supply.supply_id] || 0
                      const unassigned = Math.max(0, (supply.global_quantity || 0) - totalAssigned)
                      return (
                        <Box key={key} display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                          {editingSupply.id === supply.id && editingSupply.opId === op.id ? (
                            <>
                              <TextField
                                size="small"
                                type="number"
                                label="Quantity"
                                value={editingSupply.quantity}
                                onChange={(e) =>
                                  setEditingSupply({ ...editingSupply, quantity: e.target.value })
                                }
                              />
                              <TextField
                                size="small"
                                type="number"
                                label="Low Stock Threshold"
                                value={editingSupply.low_stock_threshold}
                                onChange={(e) =>
                                  setEditingSupply({ ...editingSupply, low_stock_threshold: e.target.value })
                                }
                              />
                              <IconButton onClick={handleSupplySave}><SaveIcon /></IconButton>
                              <IconButton onClick={() => setEditingSupply({})}><CancelIcon /></IconButton>
                            </>
                          ) : (
                            <>
                              <Typography fontWeight="bold">
                                {supply.supply_name}
                              </Typography>
                              <Tooltip title={<Typography sx={{ fontSize: '14px' }}>This is the quantity you have of this supply in this operatory.</Typography>} arrow>
                                <Chip label={`Qty: ${supply.quantity}`} size="small" />
                              </Tooltip>
                              <Tooltip title={<Typography sx={{ fontSize: '14px' }}>This is the amount of available global stock that has not been allocated to an operatory yet. You have this amount available to allocate towards this or any other operatory.</Typography>} arrow>
                                <Chip label={`Unassigned: ${unassigned}`} size="small" />
                              </Tooltip>
                              <Chip label={`Unit: ${supply.unit}`} size="small" />
                              <Tooltip title={<Typography sx={{ fontSize: '14px' }}>When this supply at this operatory reaches at or below this threshold, you will get a low stock alert.</Typography>} arrow>
                                <Chip
                                  label={`Low Stock: ${supply.low_stock_threshold || 0}`}
                                  variant="outlined"
                                  size="small"
                                  color={showWarning ? 'error' : 'default'}
                                />
                              </Tooltip>
                              <IconButton onClick={() => handleSupplyEdit(op.id, supply)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleSupplyDelete(supply.id, op.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                ) : (
                  <Typography variant="body2" ml={2}>No supplies assigned</Typography>
                )}
              </Collapse>
            </Paper>
          ))}
        </List>
      )}

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
    </Box>
  )
}
