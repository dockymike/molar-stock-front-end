// src/components/Common/AddSupplierButton.jsx

import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function AddSupplierButton({ onClick }) {
  return (
    <Button
      variant="outlined"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{ height: 40 }}
    >
      Add New
    </Button>
  )
}
