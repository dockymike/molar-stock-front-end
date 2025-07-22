// src/pages/LocationsPage.jsx
import {
  Box,
  Typography,
  Stack,
} from '@mui/material'
import { useEffect, useState } from 'react'
import AddInventoryButton from '../components/Common/AddInventoryButton'
import AddInventoryModal from '../components/Modals/AddInventoryModal'
import ConsumeInventoryButton from '../components/Common/ConsumeInventoryButton'
import ConsumeModal from '../components/Modals/ConsumeModal'
import AddLocationButton from '../components/Common/AddLocationButton'
import AddLocationModal from '../components/Modals/AddLocationModal'
import ExportButton from '../components/Common/ExportButton'
import SearchBar from '../components/Common/SearchBar'
import Pagination from '../components/Common/Pagination'
import LocationsTable from '../components/LocationsTable/LocationsTable'
import { useUser } from '../context/UserContext'

import {
  fetchLocations,
  addLocation,
} from '../services/LocationService'

export default function LocationsPage() {
  const { isAuthenticated } = useUser()

  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 5 })
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false)
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false)
  const [isConsumeOpen, setIsConsumeOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return

      // Add a small delay before showing loading to prevent flashing
      const loadingTimer = setTimeout(() => setLoading(true), 200)

      try {
        const data = await fetchLocations()
        setLocations(data)
      } catch (error) {
        console.error('Error fetching locations:', error)
      } finally {
        clearTimeout(loadingTimer)
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated])

  const handleExportClick = () => alert('Export Clicked')

  const filtered = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          Locations
        </Typography>
        <Stack direction="row" spacing={2}>
          <AddInventoryButton onClick={() => setIsAddInventoryOpen(true)} />
          <ConsumeInventoryButton onClick={() => setIsConsumeOpen(true)} />
        </Stack>
      </Box>

      {/* Search + Add Row */}
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
          <AddLocationButton onClick={() => setIsAddLocationOpen(true)} />
        </Stack>
        <ExportButton onClick={handleExportClick} />
      </Box>

      {/* Table */}
      <LocationsTable
        locations={locations}
        setLocations={setLocations}
        loading={loading}
        search={searchTerm}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
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

      {/* Add Location Modal */}
  <AddLocationModal
    open={isAddLocationOpen}
    onClose={() => setIsAddLocationOpen(false)}
    onSubmit={async (newLocation) => {
      try {
        const added = await addLocation(newLocation.name)
        setLocations((prev) => [...prev, added])
      } catch (err) {
        alert('Failed to add location')
      } finally {
        setIsAddLocationOpen(false)
      }
    }}
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
