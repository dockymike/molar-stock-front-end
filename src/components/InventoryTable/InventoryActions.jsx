// src/components/InventoryTable/InventoryActions.jsx
import { IconButton, Stack, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz' // 🔁 Transfer icon

export default function InventoryActions({ supplyId, onEdit, onDelete, onTransfer }) {
  const handleEdit = () => {
    onEdit?.(supplyId)
  }

  const handleDelete = () => {
    onDelete?.(supplyId)
  }

  const handleTransfer = () => {
    onTransfer?.(supplyId)
  }

  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Tooltip title="Edit">
        <IconButton color="secondary" onClick={handleEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Transfer">
        <IconButton color="primary" onClick={handleTransfer}>
          <SwapHorizIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton color="error" onClick={handleDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

