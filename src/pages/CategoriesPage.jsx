// src/pages/CategoriesPage.jsx
import {
  Box,
  Typography,
  Stack,
} from '@mui/material'
import { useEffect, useState } from 'react'
import AddInventoryButton from '../components/Common/AddInventoryButton'
import ConsumeInventoryButton from '../components/Common/ConsumeInventoryButton'
import AddCategoryButton from '../components/Common/AddCategoryButton'
import ExportButton from '../components/Common/ExportButton'
import SearchBar from '../components/Common/SearchBar'
import Pagination from '../components/Common/Pagination'
import CategoriesTable from '../components/CategoriesTable/CategoriesTable'
import CategoryEditForm from '../components/CategoriesTable/CategoryEditForm'
import CategoryDeletePrompt from '../components/CategoriesTable/CategoryDeletePrompt'
import EditRevisedModal from '../components/Modals/EditRevisedModal'
import AddCategoryModal from '../components/Modals/AddCategoryModal'
import ConsumeModal from '../components/Modals/ConsumeModal'
import AddInventoryModal from '../components/Modals/AddInventoryModal'

import { useUser } from '../context/UserContext'
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/CategoriesService'

export default function CategoriesPage() {
  const { isAuthenticated } = useUser()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 5 })

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false)
  const [isConsumeOpen, setIsConsumeOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return

      // Add a small delay before showing loading to prevent flashing
      const loadingTimer = setTimeout(() => setLoading(true), 200)

      try {
        const data = await fetchCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        clearTimeout(loadingTimer)
        setLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  const handleAddCategory = async (newCat) => {
    const added = await createCategory(newCat)
    setCategories((prev) => [...prev, added])
    setIsAddCategoryOpen(false)
  }

  const handleEditCategory = async (updatedCat) => {
    const result = await updateCategory(selectedCategory.id, updatedCat)
    setCategories((prev) =>
      prev.map((c) => (c.id === result.id ? result : c))
    )
    setIsEditModalOpen(false)
    setSelectedCategory(null)
  }

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(selectedCategory.id)
      setCategories((prev) =>
        prev.filter((c) => c.id !== selectedCategory.id)
      )
      setIsDeletePromptOpen(false)
      setSelectedCategory(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed')
    }
  }

  const filtered = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginated = filtered.slice(
    pagination.page * pagination.rowsPerPage,
    pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
  )

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: 0, mx: 0 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Categories
        </Typography>
        <Stack direction="row" spacing={2}>
          <AddInventoryButton onClick={() => setIsAddInventoryOpen(true)} />
          <ConsumeInventoryButton onClick={() => setIsConsumeOpen(true)} />
        </Stack>
      </Box>

      {/* Search + Add + Export */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" spacing={2} flex="1">
          <SearchBar onChange={setSearchTerm} />
          <AddCategoryButton onClick={() => setIsAddCategoryOpen(true)} />
        </Stack>
        <ExportButton onClick={() => alert('Export Clicked')} />
      </Box>

      {/* Categories Table */}
      <CategoriesTable
        data={paginated}
        loading={loading}
        onEditCategory={(cat) => {
          setSelectedCategory(cat)
          setIsEditModalOpen(true)
        }}
        onDeleteCategory={(cat) => {
          setSelectedCategory(cat)
          setIsDeletePromptOpen(true)
        }}
      />

      <Pagination
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        count={filtered.length}
        onChangePage={(page) =>
          setPagination((prev) => ({ ...prev, page }))
        }
        onChangeRowsPerPage={(rowsPerPage) =>
          setPagination((prev) => ({ ...prev, rowsPerPage }))
        }
      />

      {/* Modals */}
      <AddCategoryModal
        open={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />

      <EditRevisedModal
        open={isEditModalOpen}
        title="Edit Category"
        onClose={() => {
          setSelectedCategory(null)
          setIsEditModalOpen(false)
        }}
        onSave={handleEditCategory}
        initialData={selectedCategory}
        ContentComponent={CategoryEditForm}
      />

      <CategoryDeletePrompt
        open={isDeletePromptOpen}
        onClose={() => {
          setIsDeletePromptOpen(false)
          setSelectedCategory(null)
        }}
        onConfirm={handleDeleteCategory}
        category={selectedCategory}
      />

      <AddInventoryModal
        open={isAddInventoryOpen}
        onClose={() => setIsAddInventoryOpen(false)}
        onScan={() => {
          setIsAddInventoryOpen(false)
          alert('Open Scan Mode')
        }}
        onManual={() => {
          setIsAddInventoryOpen(false)
          alert('Open Manual Entry')
        }}
      />

      <ConsumeModal
        open={isConsumeOpen}
        onClose={() => setIsConsumeOpen(false)}
        onSubmit={(data) => {
          setIsConsumeOpen(false)
        }}
      />
    </Box>
  )
}
