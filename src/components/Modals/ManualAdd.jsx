// ✅ ManualAdd.jsx – modal for manual inventory entry

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DropDownSelect from '../Common/DropDownSelect'
import CounterInput from '../Common/CounterInput'
import { addInventory, fetchInventoryOptions } from '../../services/InventoryService'
import { fetchLocations } from '../../services/LocationService'
import { useUser } from '../../context/UserContext'
import { useLowStock } from '../../context/LowStockContext'


export default function ManualAdd({ open, onClose, onInventoryAdded }) {
  const [location, setLocation] = useState('')
  const [supplyOptions, setSupplyOptions] = useState([])
  const [locationOptions, setLocationOptions] = useState([])
  const [selectedSupplies, setSelectedSupplies] = useState([])
  const [addNewDialogOpen, setAddNewDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const { user, isAuthenticated } = useUser()

  const { triggerLowStockRefresh } = useLowStock()


  

  useEffect(() => {
    if (open && user && isAuthenticated) {
      setIsLoadingData(true)
      const load = async () => {
        try {
          const invOptions = await fetchInventoryOptions()
          const locs = await fetchLocations()
          setSupplyOptions(invOptions)
          setLocationOptions(locs)
        } catch (err) {
          console.error('❌ Failed to fetch dropdown data:', err)
        } finally {
          setIsLoadingData(false)
        }
      }
      load()
    } else if (!open) {
      setIsLoadingData(false)
    }
  }, [open, user, isAuthenticated])

  const handleSubmit = async () => {
    const payload = {
      method: 'add',
      location,
      entryType: 'manual',
      supplies: selectedSupplies.map((s) =>
        typeof s.supply === 'string'
          ? { isNew: true, name: s.supply, quantity: s.quantity, location_id: location }
          : { isNew: false, inventory_id: s.supply.inventory_id, quantity: s.quantity, location_id: location }
      ),
    }

    try {
      await addInventory(payload)
      onInventoryAdded?.()

      // Add small delay to ensure database transaction is committed before refreshing alerts
      setTimeout(() => {
        triggerLowStockRefresh()
      }, 100)

    } catch (err) {
    }
    onClose()
  }

const handleAddNewItem = async () => {
  // Prevent duplicates
  const duplicate = supplyOptions.find(
    (s) => s.name.toLowerCase() === newItemName.trim().toLowerCase()
  )
  if (duplicate) {
    alert(`Item "${newItemName}" already exists.`)
    return
  }

  const payload = {
    method: 'add',
    location,
    entryType: 'manual',
    supplies: [{ isNew: true, name: newItemName.trim(), quantity: newItemQuantity, location_id: location }],
  }

  try {
    await addInventory(payload)
    onInventoryAdded?.()

    // Add small delay to ensure database transaction is committed before refreshing alerts
    setTimeout(() => {
      triggerLowStockRefresh()
    }, 100)

  } catch (err) {
  }

  setNewItemName('')
  setNewItemQuantity(1)
  setAddNewDialogOpen(false)
  onClose()
}


  const filteredSupplyOptions = supplyOptions.filter(
    (supply) =>
      !selectedSupplies.some((s) => {
        const invId = s?.supply?.inventory_id ?? s?.inventory_id
        return invId === supply.inventory_id
      })
  )

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Manual Add</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <DropDownSelect
              label="Select Location"
              value={location}
              onChange={setLocation}
              options={locationOptions.map((loc) => ({ id: loc.id, name: loc.name }))}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600}>Search Items</Typography>
              <Tooltip title={location ? 'Add new item' : 'Select a location first'}>
                <span>
                  <IconButton size="small" onClick={() => setAddNewDialogOpen(true)} disabled={!location}>
                    <AddIcon /> New Item
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            <Autocomplete
              options={filteredSupplyOptions}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
              onChange={(_, value) => {
                if (!value) return
                setSelectedSupplies((prev) => [...prev, { supply: value, quantity: newItemQuantity }])
              }}
              renderInput={(params) => <TextField {...params} label="Search Items" fullWidth />}
              clearOnBlur
              selectOnFocus
              freeSolo
            />
            {selectedSupplies.map((item, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography sx={{ flex: 1 }}>
                  {typeof item.supply === 'string' ? item.supply : item.supply?.name}
                </Typography>
                <CounterInput
                  value={item.quantity}
                  setValue={(val) => {
                    const updated = [...selectedSupplies]
                    updated[i].quantity = val
                    setSelectedSupplies(updated)
                  }}
                />
                <Button color="error" onClick={() => setSelectedSupplies((prev) => prev.filter((_, idx) => idx !== i))}>
                  x
                </Button>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addNewDialogOpen} onClose={() => setAddNewDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Item Name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} fullWidth autoFocus />
            <CounterInput value={newItemQuantity} setValue={setNewItemQuantity} label="Quantity" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddNewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNewItem} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
