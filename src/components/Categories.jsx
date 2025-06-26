import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'

import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/CategoriesService'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editedName, setEditedName] = useState('')
  const [toast, setToast] = useState({ open: false, message: '' })

  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user?.id) return
    fetchCategories(user.id).then((data) => {
      setCategories(data)
      setLoading(false)
    })
  }, [user?.id])

  const handleAddCategory = () => {
    if (!name.trim()) return
    const newCategory = { user_id: user.id, name }

    createCategory(newCategory)
      .then((cat) => setCategories((prev) => [...prev, cat]))
      .catch((err) => console.error('Category add failed:', err))

    setName('')
  }

  const handleEdit = (id, currentName) => {
    setEditingId(id)
    setEditedName(currentName)
  }

  const handleSave = async () => {
    const updated = await updateCategory(editingId, { name: editedName })
    setCategories((prev) =>
      prev.map((cat) => (cat.id === editingId ? updated : cat))
    )
    setEditingId(null)
    setEditedName('')
    setToast({ open: true, message: 'Category saved successfully' })
  }

const handleDelete = async (id) => {
  try {
    await deleteCategory(id)
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  } catch (err) {
    console.error('Category delete failed:', err)
    const message =
      err?.response?.data?.error || 'An error occurred while deleting the category.'
    alert(message) // 👈 Regular popup for failure
  }
}


  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Supply Categories
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddCategory}>
          Add Category
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        categories.map((cat) => (
          <Paper
            key={cat.id}
            sx={{
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {editingId === cat.id ? (
              <>
                <TextField
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  fullWidth
                />
                <IconButton onClick={handleSave}><SaveIcon /></IconButton>
              </>
            ) : (
              <>
                <Typography fontWeight="bold">{cat.name}</Typography>
                <Box>
                  <IconButton onClick={() => handleEdit(cat.id, cat.name)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton>
                </Box>
              </>
            )}
          </Paper>
        ))
      )}

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
