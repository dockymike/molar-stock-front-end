import { Box, Button, Typography } from '@mui/material'

export default function QuantitySelector({ quantity, setQuantity }) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</Button>
      <Typography>{quantity}</Typography>
      <Button onClick={() => setQuantity((q) => q + 1)}>+</Button>
    </Box>
  )
}
