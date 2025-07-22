// src/components/Common/AddInventoryButton.jsx
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function AddInventoryButton({ onClick }) {
  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onClick}
    >
      Add Inventory
    </Button>
  )
}
