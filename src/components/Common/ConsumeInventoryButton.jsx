// src/components/Common/ConsumeInventoryButton.jsx
import { Button } from '@mui/material'
import RemoveIcon from '@mui/icons-material/Remove'

export default function ConsumeInventoryButton({ onClick }) {
  return (
    <Button
      variant="outlined"
      startIcon={<RemoveIcon />}
      onClick={onClick}
    >
      Consume Inventory
    </Button>
  )
}
