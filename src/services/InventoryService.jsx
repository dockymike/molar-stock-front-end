// ✅ src/services/InventoryService.js

import api from './api.jsx'

// ✅ Fetch all inventory items with optional filters
export async function fetchInventory({ search = '', filters = {}, pagination = {} }) {
  try {
    const query = new URLSearchParams()

    if (search) query.append('search', search)

    if (pagination.page != null) query.append('page', pagination.page)
    if (pagination.rowsPerPage != null) query.append('limit', pagination.rowsPerPage)

    if (filters?.category) {
      query.append('category', filters.category)
    }

    if (filters?.locations && filters.locations.length > 0 && !filters.locations.includes('all')) {
      query.append('locations', filters.locations.join(','))
    }

    const response = await api.get(`/inventory?${query.toString()}`)
    return response.data
  } catch (err) {
    throw err
  }
}


// ✅ Add Inventory Entry (includes location info)
export async function addInventory(data) {
  try {
    const response = await api.post('/inventory/add', data)
    return response.data
  } catch (err) {
    throw err
  }
}

// ✅ Update inventory for a specific location
export async function updateInventory(id, data) {
  const locationId = data.location_id

  if (!locationId) {
    throw new Error('Location ID is required to update inventory')
  }

  try {
    const response = await api.put(`/inventory/${id}`, data)
    return response.data
  } catch (err) {
    throw err
  }
}

// ✅ Delete inventory for ONE location
export async function deleteInventory(inventoryId, locationId) {
  if (!inventoryId || !locationId) {
    throw new Error('deleteInventory needs both inventoryId and locationId')
  }

  try {
    const response = await api.delete(
      `/inventory/${inventoryId}/location/${locationId}`
    )
    return response.data            // { message: 'Item deleted from location successfully' }
  } catch (err) {
    console.error('❌ Error deleting inventory from location:', err?.response?.data || err.message)
    throw err
  }
}


// Fetching intentory options without location data for search
export async function fetchInventoryOptions() {
  try {
    const response = await api.get('/inventory/options')
    return response.data
  } catch (err) {
    console.error('❌ Failed to fetch search options:', err?.response?.data || err.message)
    throw err
  }
}


// ✅ Transfer inventory between locations
export async function transferInventory(data) {
  try {
    const response = await api.post('/inventory/transfer', data)
    return response.data
  } catch (err) {
    console.error('❌ Error transferring inventory:', err?.response?.data || err.message)
    throw err
  }
}


// ✅ Consume inventory from a location
export async function consumeInventory(data) {
  try {
    const response = await api.post('/inventory/consume', data)
    return response.data
  } catch (err) {
    console.error('❌ Inventory consume error:', err?.response?.data || err.message)
    throw err
  }
}



