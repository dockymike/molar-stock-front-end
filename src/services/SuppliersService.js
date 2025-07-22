// ✅ src/services/SuppliersService.js
import api from './api.jsx'

// ✅ Fetch all suppliers  
export async function fetchSuppliers() {
  try {
    const res = await api.get('/suppliers')
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Failed to fetch suppliers:', err?.response?.data || err.message)
    return []
  }
}

// ✅ Add a new supplier
export async function addSupplier(data) {
  try {
    const res = await api.post('/suppliers', data)
    return res.data
  } catch (err) {
    console.error('❌ Failed to add supplier:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Update supplier
export async function updateSupplier(id, updatedData) {
  try {
    const res = await api.put(`/suppliers/${id}`, updatedData)
    return res.data
  } catch (err) {
    console.error('❌ Failed to update supplier:', err?.response?.data || err.message)
    throw err
  }
}

// ✅ Delete supplier
export async function deleteSupplier(id) {
  try {
    const res = await api.delete(`/suppliers/${id}`)
    return res.data
  } catch (err) {
    console.error('❌ Failed to delete supplier:', err?.response?.data || err.message)
    throw err
  }
}
