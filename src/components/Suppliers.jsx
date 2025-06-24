import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'

import {
  fetchSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/SuppliersService'

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [poc, setPoc] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [webLink, setWebLink] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editedSupplier, setEditedSupplier] = useState({})

  const [toastOpen, setToastOpen] = useState(false)

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  const loadSuppliers = () => {
    if (!user?.id) return
    setLoading(true)
    fetchSuppliers(user.id, token)
      .then((data) => setSuppliers(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSuppliers()
  }, [user?.id])

  const handleAdd = () => {
    if (!name.trim()) return
    const data = {
      user_id: user.id,
      name,
      poc,
      email,
      phone,
      web_link: webLink,
    }

    addSupplier(data)
      .then((newSupplier) => {
        setSuppliers((prev) => [newSupplier, ...prev])
        setName('')
        setPoc('')
        setEmail('')
        setPhone('')
        setWebLink('')
      })
      .catch((err) => console.error('Add failed:', err))
  }

  const handleDelete = async (id) => {
    await deleteSupplier(id)
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
  }

  const handleEdit = (supplier) => {
    setEditingId(supplier.id)
    setEditedSupplier({ ...supplier })
  }

  const handleSave = async () => {
    await updateSupplier(editingId, editedSupplier)
    setEditingId(null)
    setEditedSupplier({})
    loadSuppliers()
    setToastOpen(true)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Suppliers
      </Typography>

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField label="Supplier Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Point of Contact" value={poc} onChange={(e) => setPoc(e.target.value)} />
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField label="Website Link" value={webLink} onChange={(e) => setWebLink(e.target.value)} />
        <Button variant="contained" onClick={handleAdd}>
          Add Supplier
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : suppliers.length === 0 ? (
        <Typography>No suppliers found.</Typography>
      ) : (
        suppliers.map((sup) => (
          <Paper key={sup.id} sx={{ p: 2, mb: 2 }}>
            {editingId === sup.id ? (
              <>
                <TextField
                  fullWidth
                  label="Name"
                  value={editedSupplier.name}
                  onChange={(e) =>
                    setEditedSupplier((prev) => ({ ...prev, name: e.target.value }))
                  }
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="POC"
                  value={editedSupplier.poc}
                  onChange={(e) =>
                    setEditedSupplier((prev) => ({ ...prev, poc: e.target.value }))
                  }
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={editedSupplier.email}
                  onChange={(e) =>
                    setEditedSupplier((prev) => ({ ...prev, email: e.target.value }))
                  }
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={editedSupplier.phone}
                  onChange={(e) =>
                    setEditedSupplier((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Website"
                  value={editedSupplier.web_link}
                  onChange={(e) =>
                    setEditedSupplier((prev) => ({ ...prev, web_link: e.target.value }))
                  }
                  sx={{ mb: 1 }}
                />
                <IconButton onClick={handleSave}><SaveIcon /></IconButton>
              </>
            ) : (
              <>
                <Typography fontWeight="bold">{sup.name}</Typography>
                <Typography variant="body2">POC: {sup.poc || '—'}</Typography>
                <Typography variant="body2">Email: {sup.email || '—'}</Typography>
                <Typography variant="body2">Phone: {sup.phone || '—'}</Typography>
                <Typography variant="body2">
                  Website: {sup.web_link ? <a href={sup.web_link} target="_blank" rel="noopener noreferrer">{sup.web_link}</a> : '—'}
                </Typography>
                <Box mt={1}>
                  <IconButton onClick={() => handleEdit(sup)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(sup.id)}><DeleteIcon /></IconButton>
                </Box>
              </>
            )}
          </Paper>
        ))
      )}

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        message="Supplier saved successfully"
      />
    </Box>
  )
}
