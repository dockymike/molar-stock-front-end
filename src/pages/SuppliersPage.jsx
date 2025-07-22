// src/pages/SuppliersPage.jsx
// src/pages/SuppliersPage.jsx
import {
  Box,
  Typography,
  Stack,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext' // ✅ Import UserContext

import AddInventoryButton from '../components/Common/AddInventoryButton'
import ConsumeInventoryButton from '../components/Common/ConsumeInventoryButton'
import ConsumeModal from '../components/Modals/ConsumeModal'
import AddSupplierButton from '../components/Common/AddSupplierButton'
import AddSupplierModal from '../components/Modals/AddSupplierModal'
import AddInventoryModal from '../components/Modals/AddInventoryModal'
import ExportButton from '../components/Common/ExportButton'
import SearchBar from '../components/Common/SearchBar'
import Pagination from '../components/Common/Pagination'
import SuppliersTable from '../components/SuppliersTable/SuppliersTable'
import SupplierEditForm from '../components/SuppliersTable/SupplierEditForm'
import SupplierDeletePrompt from '../components/SuppliersTable/SupplierDeletePrompt'
import EditRevisedModal from '../components/Modals/EditRevisedModal'

import {
  fetchSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from '../services/SuppliersService'

export default function SuppliersPage() {
  const { isAuthenticated } = useUser()

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false)
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false)
  const [isConsumeOpen, setIsConsumeOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false)

  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 5 })

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchData = async () => {
      // Add a small delay before showing loading to prevent flashing
      const loadingTimer = setTimeout(() => setLoading(true), 200)

      try {
        const data = await fetchSuppliers()
        setSuppliers(data)
      } catch (error) {
        console.error('Error fetching suppliers:', error)
      } finally {
        clearTimeout(loadingTimer)
        setLoading(false)
      }
    }
    fetchData()
  }, [isAuthenticated])

  const handleExportClick = () => alert('Export Clicked')

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginated = filtered.slice(
    pagination.page * pagination.rowsPerPage,
    pagination.page * pagination.rowsPerPage + pagination.rowsPerPage
  )

  const handleAddSupplier = async (newSupplier) => {
    const added = await addSupplier(newSupplier)
    setSuppliers((prev) => [...prev, added])
    setIsAddSupplierOpen(false)
  }

  const handleEditSupplier = async (updatedSupplier) => {
    const result = await updateSupplier(selectedSupplier.id, updatedSupplier)
    setSuppliers((prev) =>
      prev.map((s) => (s.id === result.id ? result : s))
    )
    setSelectedSupplier(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteSupplier = async () => {
    try {
      await deleteSupplier(selectedSupplier.id)
      setSuppliers((prev) =>
        prev.filter((s) => s.id !== selectedSupplier.id)
      )
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed')
    } finally {
      setSelectedSupplier(null)
      setIsDeletePromptOpen(false)
    }
  }

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
          Suppliers
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
          <AddSupplierButton onClick={() => setIsAddSupplierOpen(true)} />
        </Stack>
        <ExportButton onClick={handleExportClick} />
      </Box>

      {/* Table */}
      <SuppliersTable
        data={paginated}
        loading={loading}
        onEditSupplier={(supplier) => {
          setSelectedSupplier(supplier)
          setIsEditModalOpen(true)
        }}
        onDeleteSupplier={(supplier) => {
          setSelectedSupplier(supplier)
          setIsDeletePromptOpen(true)
        }}
      />

      {/* Pagination */}
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

      {/* Add Supplier Modal */}
      <AddSupplierModal
        open={isAddSupplierOpen}
        onClose={() => setIsAddSupplierOpen(false)}
        onAdd={handleAddSupplier}
      />

      {/* Add Inventory Modal */}
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

      {/* Consume Inventory Modal */}
      <ConsumeModal
        open={isConsumeOpen}
        onClose={() => setIsConsumeOpen(false)}
        onSubmit={(data) => {
          setIsConsumeOpen(false)
        }}
      />

      {/* Edit Supplier Modal */}
      <EditRevisedModal
        open={isEditModalOpen}
        onClose={() => {
          setSelectedSupplier(null)
          setIsEditModalOpen(false)
        }}
        onSave={handleEditSupplier}
        initialData={selectedSupplier}
        title="Edit Supplier"
        ContentComponent={SupplierEditForm}
      />

      {/* Delete Prompt */}
      <SupplierDeletePrompt
        open={isDeletePromptOpen}
        onClose={() => {
          setSelectedSupplier(null)
          setIsDeletePromptOpen(false)
        }}
        onConfirm={handleDeleteSupplier}
        supplier={selectedSupplier}
      />
    </Box>
  )
}
