// src/components/SuppliersTable/SupplierActions.jsx

import { IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function SupplierActions({ supplier, onEdit, onDelete }) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton onClick={() => onEdit(supplier)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={() => onDelete(supplier)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}
