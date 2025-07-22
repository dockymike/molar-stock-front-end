// src/components/Common/AddCategoryButton.jsx
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

export default function AddCategoryButton({ onClick }) {
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
