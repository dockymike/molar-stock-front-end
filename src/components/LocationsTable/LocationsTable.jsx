// src/components/LocationsTable/LocationsTable.jsx

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import LocationActions from './LocationActions'
import LocationEditForm from './LocationEditForm'
import LocationDeletePrompt from './LocationDeletePrompt'
import { updateLocation, deleteLocation } from '../../services/LocationService'

export default function LocationsTable({
  locations = [],
  setLocations,
  search = '',
  page = 0,
  rowsPerPage = 5,
  loading = false,
}) {
  const theme = useTheme()
  const [editData, setEditData] = useState(null)
  const [deleteData, setDeleteData] = useState(null)

  const handleEdit = (location) => setEditData(location)
  const handleDelete = (location) => setDeleteData(location)

  const filtered = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        <CircularProgress />
      </Typography>
    )
  }

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: '100%',
          boxShadow: 'none',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Table sx={{ width: '100%' }}>
          <TableHead
            sx={{
              backgroundColor:
                theme.palette.mode === 'dark' ? '#1f1f1f' : '#f5f5f5',
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                Name
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell sx={{ color: theme.palette.text.primary }}>
                    {loc.name}
                  </TableCell>
                  <TableCell align="right">
                    <LocationActions
                      onEdit={() => handleEdit(loc)}
                      onDelete={() => handleDelete(loc)}
                      protected={loc.protected}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  No locations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {editData && (
        <LocationEditForm
          open={true}
          initialData={editData}
          onClose={() => setEditData(null)}
          onSave={async (updated) => {
            try {
              const res = await updateLocation(editData.id, updated) // res is the updated full location object
              setLocations((prev) =>
                prev.map((loc) =>
                  loc.id === editData.id ? res : loc
                )
              )
            } catch (err) {
              alert('Failed to update location')
            } finally {
              setEditData(null)
            }
          }}
        />
      )}

      {deleteData && (
        <LocationDeletePrompt
          open={true}
          location={deleteData}
          onClose={() => setDeleteData(null)}
          onConfirm={async () => {
            try {
              await deleteLocation(deleteData.id)
              setLocations((prev) =>
                prev.filter((loc) => loc.id !== deleteData.id)
              )
            } catch (err) {
              alert(err.response?.data?.error || 'Could not delete location')
            } finally {
              setDeleteData(null)
            }
          }}
        />
      )}
    </>
  )
}

