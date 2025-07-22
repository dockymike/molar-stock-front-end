import { Box, IconButton, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function CounterInput({ value, setValue, min = 0, max = 999 }) {
  const handleIncrement = () => {
    if (value < max) setValue(value + 1)
  }

  const handleDecrement = () => {
    if (value > min) setValue(value - 1)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton onClick={handleDecrement}>
        <RemoveIcon />
      </IconButton>
      <TextField
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10)
          if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            setValue(newValue)
          }
        }}
        inputProps={{ min, max, style: { textAlign: 'center' } }}
        sx={{ width: 80 }}
      />
      <IconButton onClick={handleIncrement}>
        <AddIcon />
      </IconButton>
    </Box>
  )
}
