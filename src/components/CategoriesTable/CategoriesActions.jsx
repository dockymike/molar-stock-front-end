// src/components/CategoriesTable/CategoriesActions.jsx
import { IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function CategoriesActions({ category, onEdit, onDelete }) {
  return (
    <>
      <Tooltip title="Edit">
        <IconButton onClick={() => onEdit(category)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete">
        <IconButton onClick={() => onDelete(category)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}
