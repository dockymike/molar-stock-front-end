import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
const getToken = () => localStorage.getItem('token')

// ✅ Assign supply to operatory
export const assignSupplyToOperatory = async (data) => {
  console.log('📦 Assigning supply to operatory...')
  console.log('➡️ API:', `${BASE_URL}/op-supplies`)
  console.log('📤 Payload:', data)
  console.log('🔐 Token Present:', !!getToken())

  try {
    const res = await axios.post(`${BASE_URL}/op-supplies`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log('✅ Assigned successfully:', res.data)
    return res.data
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to assign supply'
    console.error('❌ Assign error:', message)
    console.error('📄 Full Error:', err)
    throw new Error(message)
  }
}

// ✅ Get all supplies assigned to an operatory
export const fetchOpSupplies = async (opId) => {
  console.log(`📥 Fetching op supplies for operatory ${opId}`)
  console.log('➡️ API:', `${BASE_URL}/op-supplies/${opId}`)
  console.log('🔐 Token Present:', !!getToken())

  try {
    const res = await axios.get(`${BASE_URL}/op-supplies/${opId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log(`✅ Op supplies received for Op ${opId}:`, res.data)
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error(`❌ Error fetching op supplies for Op ${opId}:`, err.response?.data || err.message)
    return []
  }
}

// ✅ Update quantity for a specific op-supply link
export const updateOpSupplyQuantity = async (id, quantity) => {
  console.log('✏️ Updating op-supply quantity...')
  console.log('➡️ API:', `${BASE_URL}/op-supplies/${id}`)
  console.log('📤 Payload:', { quantity })

  try {
    const res = await axios.patch(`${BASE_URL}/op-supplies/${id}`, { quantity }, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log('✅ Quantity updated:', res.data)
    return res.data
  } catch (err) {
    console.error('❌ Error updating quantity:', err.response?.data || err.message)
    throw err
  }
}

// ✅ Delete op-supply link
export const deleteOpSupply = async (id) => {
  console.log('🗑️ Deleting op-supply...')
  console.log('➡️ API:', `${BASE_URL}/op-supplies/${id}`)

  try {
    await axios.delete(`${BASE_URL}/op-supplies/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log('✅ Supply deleted from operatory')
  } catch (err) {
    console.error('❌ Error deleting supply:', err.response?.data || err.message)
    throw err
  }
}

// ✅ Get total assigned quantity across all operatories for a supply
export const fetchAssignedQuantity = async (supplyId) => {
  console.log('📊 Fetching total assigned quantity...')
  const endpoint = `${BASE_URL}/op-supplies/assigned/${supplyId}?total=true`
  console.log('➡️ API:', endpoint)
  console.log('🔐 Token Present:', !!getToken())

  try {
    const res = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log(`✅ Assigned quantity for supply ${supplyId}:`, res.data.assigned)
    return res.data.assigned
  } catch (err) {
    console.error('❌ Error fetching assigned quantity:', err.response?.data || err.message)
    return 0
  }
}
