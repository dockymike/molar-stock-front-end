// src/components/LocationsTable/LocationActions.jsx

// src/components/LocationsTable/LocationActions.jsx

import { IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function LocationActions({ onEdit, onDelete, protected: isProtected }) {
  return (
    <>
      {!isProtected && (
        <>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton onClick={onEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip title="Delete">
              <IconButton onClick={onDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </>
  )
}
