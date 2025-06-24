import { useEffect, useState } from 'react'
import {
  Box, Typography, TextField, Button, Paper,
  MenuItem, Select, FormControl, InputLabel, List,
  ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Snackbar, Alert, Divider, Chip, Card, CardContent, CardActions
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'

import {
  fetchProcedures,
  addProcedure,
  addSupplyToProcedure,
  fetchSuppliesForProcedure,
  deleteSupplyFromProcedure,
  updateProcedureSupplyQuantity,
  updateProcedureName,
  deleteProcedure
} from '../services/ProceduresService'
import { fetchSupplies } from '../services/SuppliesService'

export default function Procedures() {
  const [procedures, setProcedures] = useState([])
  const [supplies, setSupplies] = useState([])
  const [procedureName, setProcedureName] = useState('')
  const [activeProcedureId, setActiveProcedureId] = useState(null)
  const [selectedSupply, setSelectedSupply] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [editingSupplyId, setEditingSupplyId] = useState(null)
  const [editedQuantity, setEditedQuantity] = useState(1)
  const [editingProcedureId, setEditingProcedureId] = useState(null)
  const [editedProcedureName, setEditedProcedureName] = useState('')
  const [toast, setToast] = useState({ open: false, message: '' })

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user?.id) return

    fetchProcedures(user.id).then(async (fetched) => {
      const enriched = await Promise.all(
        fetched.map(async (proc) => {
          const supplyList = await fetchSuppliesForProcedure(proc.id)
          return { ...proc, supplies: supplyList }
        })
      )
      setProcedures(enriched)
    })

    fetchSupplies(user.id, localStorage.getItem('token')).then(setSupplies)
  }, [user?.id])

  useEffect(() => {
    setSelectedSupply('')
    setQuantity(1)
  }, [activeProcedureId])

  const refreshProcedureSupplies = async (procedureId) => {
    const updatedSupplies = await fetchSuppliesForProcedure(procedureId)
    setProcedures((prev) =>
      prev.map((p) =>
        p.id === procedureId ? { ...p, supplies: updatedSupplies } : p
      )
    )
  }

  const handleAddProcedure = () => {
    if (!procedureName.trim()) return
    addProcedure({ user_id: user.id, name: procedureName }).then((newProcedure) => {
      setProcedures((prev) => [...prev, { ...newProcedure, supplies: [] }])
      setProcedureName('')
    })
  }

  const handleAddSupply = async () => {
    if (!activeProcedureId || !selectedSupply) return

    await addSupplyToProcedure({
      procedure_id: activeProcedureId,
      supply_id: selectedSupply,
      quantity: Number(quantity),
    })

    await refreshProcedureSupplies(activeProcedureId)
    setSelectedSupply('')
    setQuantity(1)
    setToast({ open: true, message: 'Supply added to procedure' })
  }

  const handleDeleteSupply = async (supplyRowId, procedureId) => {
    await deleteSupplyFromProcedure(supplyRowId)
    await refreshProcedureSupplies(procedureId)
  }

  const handleEditSupply = (supply) => {
    setEditingSupplyId(supply.id)
    setEditedQuantity(supply.procedure_quantity || 0)
  }

  const handleSaveEdit = async (supply, procedureId) => {
    if (isNaN(editedQuantity) || editedQuantity < 0) {
      alert('Quantity must be a valid non-negative number.')
      return
    }

    await updateProcedureSupplyQuantity(supply.id, Number(editedQuantity))
    setEditingSupplyId(null)
    await refreshProcedureSupplies(procedureId)
    setToast({ open: true, message: 'Supply quantity updated' })
  }

  const handleEditProcedure = (p) => {
    setEditingProcedureId(p.id)
    setEditedProcedureName(p.name)
  }

  const handleSaveProcedure = async (p) => {
    await updateProcedureName(p.id, editedProcedureName)
    setEditingProcedureId(null)
    setProcedures((prev) =>
      prev.map((proc) =>
        proc.id === p.id ? { ...proc, name: editedProcedureName } : proc
      )
    )
    setToast({ open: true, message: 'Procedure name updated' })
  }

  const handleDeleteProcedure = async (id) => {
    await deleteProcedure(id)
    setProcedures((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <Box>
      <Typography variant="h6">Procedures</Typography>

      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" my={2}>
        <TextField
          label="New Procedure Name"
          value={procedureName}
          onChange={(e) => setProcedureName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddProcedure}>
          Add Procedure
        </Button>
      </Box>

      {procedures.map((p) => (
        <Card key={p.id} sx={{ mt: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1}>
              {editingProcedureId === p.id ? (
                <>
                  <TextField
                    value={editedProcedureName}
                    onChange={(e) => setEditedProcedureName(e.target.value)}
                    size="small"
                  />
                  <IconButton onClick={() => handleSaveProcedure(p)}><SaveIcon /></IconButton>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight="bold">{p.name}</Typography>
                  <IconButton onClick={() => handleEditProcedure(p)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteProcedure(p.id)}><DeleteIcon /></IconButton>
                </>
              )}
            </Box>

            <Button
              size="small"
              variant="outlined"
              onClick={() => setActiveProcedureId(p.id === activeProcedureId ? null : p.id)}
              sx={{ mt: 1, mb: 2 }}
            >
              {activeProcedureId === p.id ? 'Cancel' : 'Add Supplies'}
            </Button>

            {activeProcedureId === p.id && (
              <Box display="flex" flexDirection="column" gap={2} mb={2}>
                <FormControl fullWidth>
                  <InputLabel>Supply</InputLabel>
                  <Select
                    value={selectedSupply}
                    label="Supply"
                    onChange={(e) => setSelectedSupply(e.target.value)}
                  >
                    {supplies.map((s) => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

                <Button variant="contained" onClick={handleAddSupply}>
                  Add Supply to Procedure
                </Button>
              </Box>
            )}

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Assigned Supplies</Typography>

            {p.supplies?.length > 0 ? (
              <List dense>
                {p.supplies.map((supply) => (
                  <ListItem
                    key={supply.id}
                    sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                  >
                    {editingSupplyId === supply.id ? (
                      <>
                        <TextField
                          type="number"
                          size="small"
                          value={editedQuantity}
                          onChange={(e) => setEditedQuantity(e.target.value)}
                          sx={{ width: 80, mr: 2 }}
                        />
                        <ListItemText primary={`${supply.supply_name} (${supply.unit || 'piece(s)'})`} />
                        <IconButton onClick={() => handleSaveEdit(supply, p.id)}><SaveIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <ListItemText
                          primary={
                            <>
                              {supply.supply_name}{' '}
                              <Chip
                                label={`x${supply.procedure_quantity} ${supply.unit || 'piece(s)'}`}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleEditSupply(supply)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDeleteSupply(supply.id, p.id)}><DeleteIcon /></IconButton>
                        </ListItemSecondaryAction>
                      </>
                    )}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box p={2} bgcolor="#f5f5f5" borderRadius={1}>
                <Typography color="text.secondary">No supplies assigned</Typography>
              </Box>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', pr: 2 }}>
            {/* Optional footer buttons */}
          </CardActions>
        </Card>
      ))}

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
