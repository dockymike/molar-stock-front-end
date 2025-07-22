// src/components/InventoryTable/InventoryEditForm.jsx
// ✅ Location displayed, shared/local fields clearly labeled

import {
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Typography,
  Box,
  Paper,
  Stack,
} from '@mui/material'
import { useEffect } from 'react'

export default function InventoryEditForm({
  formData,
  onChange,
  supplierOptions = [],
  categoryOptions = [],
  locationName = '',
}) {
  useEffect(() => {
    // formData effect hook
  }, [formData])

  return (
    <Box sx={{ width: '100%' }}>
      {/* Section: Shared Info (Affects All Locations) */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Product Info (affects all locations)
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Product Name (affects all locations)"
            name="name"
            value={formData.name || ''}
            onChange={onChange}
          />

          <FormControl fullWidth>
            <InputLabel>Category (affects all locations)</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id || ''}
              onChange={onChange}
              label="Category (affects all locations)"
            >
              {categoryOptions.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Supplier (affects all locations)</InputLabel>
            <Select
              name="supplier_id"
              value={formData.supplier_id || ''}
              onChange={onChange}
              label="Supplier (affects all locations)"
            >
              {supplierOptions.map((sup) => (
                <MenuItem key={sup.id} value={sup.id}>
                  {sup.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Unit (affects all locations)</InputLabel>
            <Select
              name="unit"
              value={formData.unit || ''}
              onChange={onChange}
              label="Unit (affects all locations)"
            >
              {['Piece(s)', 'Box(s)', 'Container(s)'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Cost per Unit (affects all locations)"
            name="cost_per_unit"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={formData.cost_per_unit ?? ''}
            onChange={onChange}
          />

          <TextField
            fullWidth
            label="Barcode (affects all locations)"
            name="barcode"
            value={formData.barcode || ''}
            onChange={onChange}
          />
        </Stack>
      </Paper>

      {/* Section: Location-Specific Info */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Location-Specific Info
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Location"
            value={locationName || '—'}
            InputProps={{ readOnly: true }}
            disabled
          />

          <TextField
            fullWidth
            label="Quantity (for this location only)"
            name="quantity"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.quantity ?? ''}
            onChange={onChange}
          />


          <TextField
            fullWidth
            label="Low Stock Threshold (for this location only)"
            name="low_stock_threshold"
            type="number"
            inputProps={{ min: 0 }}
            value={formData.low_stock_threshold ?? ''}
            onChange={onChange}
          />
        </Stack>
      </Paper>
    </Box>
  )
}

