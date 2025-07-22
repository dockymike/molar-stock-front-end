// src/components/Common/FilterDialog.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material'
import { useEffect, useState } from 'react'

export default function FilterDialog({ open, onClose, onApply, availableLocations = [] }) {
  const [sortBy, setSortBy] = useState('')
  const [selectedLocations, setSelectedLocations] = useState([])

  const handleApply = () => {
    const filters = {
      sortBy,
      locations: sortBy === 'location' ? selectedLocations : [],
    }
    onApply(filters)
    onClose()
  }

  const handleLocationChange = (event) => {
    const value = event.target.value

    if (value.includes('all')) {
      setSelectedLocations(['all'])
    } else {
      setSelectedLocations(value.filter((v) => v !== 'all'))
    }
  }

  useEffect(() => {
    if (!open) {
      setSortBy('')
      setSelectedLocations([])
    }
  }, [open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Sort / Filter Inventory</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="">Default</MenuItem>
            <MenuItem value="product">Product Name</MenuItem>
            <MenuItem value="location">Location</MenuItem>
          </Select>
        </FormControl>

        {sortBy === 'location' && (
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Select Location(s)</InputLabel>
            <Select
              multiple
              value={selectedLocations}
              onChange={handleLocationChange}
              input={<OutlinedInput label="Select Location(s)" />}
              renderValue={(selected) =>
                selected.includes('all') ? 'All Locations' : selected.join(', ')
              }
            >
              <MenuItem value="all">
                <Checkbox checked={selectedLocations.includes('all')} />
                <ListItemText primary="View All" />
              </MenuItem>
              {availableLocations.map((loc) => (
                <MenuItem key={loc.id} value={loc.name}>
                  <Checkbox checked={selectedLocations.includes(loc.name)} />
                  <ListItemText primary={loc.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  )
}
