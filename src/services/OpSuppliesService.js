import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
const getToken = () => localStorage.getItem('token')

// ✅ Assign supply to operatory
export const assignSupplyToOperatory = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/op-supplies`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return res.data
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to assign supply'
    console.error('❌ Assign error:', message)
    throw new Error(message)
  }
}

// ✅ Get all supplies assigned to an operatory
export const fetchOpSupplies = async (opId) => {
  try {
    const res = await axios.get(`${BASE_URL}/op-supplies/${opId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log(`📥 Op supplies for Op ${opId}:`, res.data)  // ✅ LOG DATA
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Error fetching op supplies:', err.response?.data || err.message)
    return []
  }
}

// ✅ Update quantity for a specific op-supply link
export const updateOpSupplyQuantity = async (id, quantity) => {
  try {
    const res = await axios.patch(`${BASE_URL}/op-supplies/${id}`, { quantity }, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return res.data
  } catch (err) {
    console.error('❌ Error updating quantity:', err.response?.data || err.message)
    throw err
  }
}

// ✅ Delete op-supply link
export const deleteOpSupply = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/op-supplies/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
  } catch (err) {
    console.error('❌ Error deleting supply:', err.response?.data || err.message)
    throw err
  }
}

// ✅ Get total assigned quantity across all operatories for a supply
export const fetchAssignedQuantity = async (supplyId) => {
  try {
    const res = await axios.get(`${BASE_URL}/op-supplies/assigned/${supplyId}?total=true`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    return res.data.assigned
  } catch (err) {
    console.error('❌ Error fetching assigned quantity:', err.response?.data || err.message)
    return 0
  }
}
