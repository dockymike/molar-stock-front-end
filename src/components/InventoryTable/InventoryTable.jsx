// ✅ Updated InventoryTable.jsx with location-based low stock threshold support

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Box,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material'
import { useEffect, useState, useMemo, useCallback, memo } from 'react'
import InventoryActions from './InventoryActions'
import placeholder from '../../assets/images/placeholder.png'
import {
  fetchInventory,
  updateInventory,
  deleteInventory,
} from '../../services/InventoryService'
import { fetchSuppliers } from '../../services/SuppliersService'
import { fetchCategories } from '../../services/CategoriesService'
import { fetchLocations } from '../../services/LocationService'
import EditModal from '../Modals/EditModal'
import InventoryEditForm from './InventoryEditForm'
import InventoryDeletePrompt from './InventoryDeletePrompt'
import { useUser } from '../../context/UserContext'
import { groupInventoryById } from '../../utils/groupInventoryById'
import TransferModal from '../Modals/TransferModal' 
import { useLowStock } from '../../context/LowStockContext'
import { useSnackbar } from 'notistack'



const InventoryTable = memo(function InventoryTable({
  search = '',
  filters = {},
  pagination,
  setTotalCount,
  refreshKey,
  onLocationsLoaded,
}) {
  const theme = useTheme()
  const { isAuthenticated } = useUser()

  const [inventory, setInventory] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [countReady, setCountReady] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)

  const { triggerLowStockRefresh } = useLowStock()
  const { enqueueSnackbar } = useSnackbar()



  const handleEdit = useCallback((item) => {
    setSelectedItem({ ...item, id: item.inventory_id, low_stock_threshold: item.location_low_stock_threshold,})
    setEditOpen(true)
  }, [])

  const handleDelete = useCallback((item) => {
    setSelectedItem(item)
    setDeleteError('')
    setDeleteOpen(true)
  }, [])

  const handleTransfer = useCallback((item) => {
    setSelectedItem(item)
    setTransferOpen(true)
  }, [])


  const loadData = useCallback(async () => {
    if (!isAuthenticated) return

    // Add a small delay before showing loading to prevent flashing
    const loadingTimer = setTimeout(() => setLoading(true), 200)

    try {
      const [inventoryData, suppliersData, categoriesData, locationsData] = await Promise.all([
        fetchInventory({ search, filters, pagination }),
        fetchSuppliers(),
        fetchCategories(),
        fetchLocations(),
      ])

      setInventory(inventoryData)
      setSuppliers(suppliersData)
      setCategories(categoriesData)
      setLocations(locationsData)
      setCountReady(true)

      // Notify parent component about loaded locations
      if (onLocationsLoaded) {
        onLocationsLoaded(locationsData)
      }
    } catch (err) {
      console.error('❌ Failed to load inventory:', err)
    } finally {
      clearTimeout(loadingTimer)
      setLoading(false)
    }
  }, [isAuthenticated, search, filters, pagination])

  // Memoized data processing
  const processedInventory = useMemo(() => {
    const groupedData = groupInventoryById(inventory)
    return groupedData.flatMap((entry) =>
      (entry.locations || []).map((loc) => ({
        ...loc,
        inventory_id: entry.inventory_id,
        name: entry.name,
        barcode: entry.barcode,
        unit: entry.unit,
        cost_per_unit: entry.cost_per_unit,
        category_id: entry.category_id,
        category_name: entry.category_name,
        supplier_id: entry.supplier_id,
        supplier_name: entry.supplier_name,
      }))
    )
  }, [inventory])

  // Memoized filtering
  const filteredInventory = useMemo(() => {
    let filtered = processedInventory

    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          (item.barcode && item.barcode.toLowerCase().includes(lowerSearch))
      )
    }

    if (filters?.category) {
      filtered = filtered.filter((item) => item.category_name === filters.category)
    }

    if (filters?.locations && filters.locations.length > 0 && !filters.locations.includes('all')) {
      filtered = filtered.filter(
        (item) => filters.locations.includes(item.location_name)
      )
    }

    return filtered
  }, [processedInventory, search, filters])

  useEffect(() => {
    loadData()
  }, [loadData, refreshKey])

  useEffect(() => {
    if (setTotalCount && countReady) {
      setTotalCount(filteredInventory.length)
    }
  }, [filteredInventory.length, setTotalCount, countReady])


const handleSaveEdit = useCallback(async () => {
  try {
    const { id, location_id, ...rest } = selectedItem
    const payload = { ...rest, location_id }

    await updateInventory(id, payload)
    await loadData()
    console.log('✅ Inventory updated, now triggering low stock refresh')

    // Add small delay to ensure database transaction is committed before refreshing alerts
    setTimeout(() => {
      triggerLowStockRefresh()
    }, 100)

    setEditOpen(false)
  } catch (err) {
    console.error('Failed to save edit:', err)
    const errorMessage = err.response?.data?.error || err.message || 'Failed to update inventory'
    enqueueSnackbar(errorMessage, { variant: 'error' })
  }
}, [selectedItem, loadData, triggerLowStockRefresh, enqueueSnackbar])


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

let filteredItems = inventory

if (search) {
  const lowerSearch = search.toLowerCase()
  filteredItems = filteredItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerSearch) ||
      (item.barcode && item.barcode.toLowerCase().includes(lowerSearch))
  )
}

if (filters?.category) {
  filteredItems = filteredItems.filter((item) => item.category_name === filters.category)
}

if (filters?.locations && filters.locations.length > 0 && !filters.locations.includes('all')) {
  filteredItems = filteredItems.filter((item) =>
    filters.locations.includes(item.location_name)
  )
}


  

  const startIndex = pagination?.page * pagination?.rowsPerPage || 0
  const endIndex = startIndex + (pagination?.rowsPerPage || filteredItems.length)
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  const isFiltered = search || filters?.category

  return (
    <>
      <TableContainer component={Paper} sx={{ width: '100%', boxShadow: 'none', backgroundColor: theme.palette.background.paper }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#1f1f1f' : '#f5f5f5' }}>
            <TableRow>
              {['Product', 'Barcode', 'Location', 'Quantity', 'Low Threshold', 'Category', 'Supplier', 'Unit', 'Cost', 'Total Cost', 'Action'].map((label, i) => (
                <TableCell
                  key={i}
                  align={label === 'Action' ? 'right' : 'left'}
                  sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedItems.map((item) => {
              const cost = parseFloat(item.cost_per_unit) || 0
              const quantity = parseFloat(item.quantity) || 0
              const totalCost = (cost * quantity).toFixed(2)

              return (
                <TableRow key={`${item.inventory_id}-${item.location_id || 'none'}`}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={placeholder} alt={item.name} />
                      <Typography sx={{ color: theme.palette.text.primary }}>{item.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{item.barcode || '-'}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{item.location_name || '-'}</TableCell>
                  <TableCell>
  {quantity <= (item.location_low_stock_threshold ?? 0) ? (
    <Chip
      label={quantity}
      color="error"
      size="small"
      sx={{ fontWeight: 'bold' }}
    />
  ) : (
    <Typography sx={{ color: theme.palette.text.primary }}>{quantity}</Typography>
  )}
</TableCell>

                  <TableCell sx={{ color: theme.palette.text.primary }}>{item.location_low_stock_threshold ?? '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.category_name || 'Uncategorized'}
                      variant="outlined"
                      sx={{ color: theme.palette.text.primary, borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[300] }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{item.supplier_name || '-'}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>{item.unit || '-'}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>${cost.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: theme.palette.text.primary }}>${totalCost}</TableCell>
                  <TableCell align="right">
                    <InventoryActions
                      supplyId={item.inventory_id}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item)}
                      onTransfer={() => handleTransfer(item)}
                    />
                  </TableCell>
                </TableRow>
              )
            })}

            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 5, color: theme.palette.text.secondary }}>
                  {isFiltered ? 'No matches found for your filters.' : 'No inventory items yet. Add one to get started!'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEdit}
        title="Edit Inventory Item"
      >
        {selectedItem && (
          <InventoryEditForm
            formData={selectedItem}
            onChange={(e) => {
              const { name, value } = e.target
              setSelectedItem((prev) => ({ ...prev, [name]: value }))
            }}
            supplierOptions={suppliers}
            categoryOptions={categories}
            locationName={selectedItem.location_name}
          />
        )}
      </EditModal>

<TransferModal
  open={transferOpen}
  onClose={() => setTransferOpen(false)}
  inventoryItem={selectedItem}
  sourceLocationId={selectedItem?.location_id}
  sourceLocationName={selectedItem?.location_name}
  locations={locations}
  onTransferred={async () => {
    setTransferOpen(false)
    await loadData()

    // Add small delay to ensure database transaction is committed before refreshing alerts
    setTimeout(() => {
      triggerLowStockRefresh()
    }, 100)
  }}
/>



      <InventoryDeletePrompt
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteError('')
        }}
        itemName={selectedItem?.name}
        errorMessage={deleteError}
        onConfirm={async () => {
          if (!selectedItem?.inventory_id) {
            console.error('❌ No ID found for selected item:', selectedItem)
            setDeleteError('Cannot delete: No inventory item selected.')
            return
          }
          try {
            await deleteInventory(selectedItem.inventory_id, selectedItem.location_id)

            await loadData()
            setDeleteOpen(false)
            setDeleteError('')
            triggerLowStockRefresh()
          } catch (err) {
            const message = err.response?.data?.error || 'Delete failed.'
            console.error('❌ Failed to delete inventory:', message)
            setDeleteError(message)
          }
        }}
      />
    </>
  )
})

export default InventoryTable