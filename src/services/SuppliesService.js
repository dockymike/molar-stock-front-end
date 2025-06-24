// ✅ Enhanced: src/services/SuppliesService.js
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export async function fetchSupplies(userId, token) {
  console.log('📦 Fetching supplies for user:', userId)

  try {
    const response = await axios.get(`${API}/supplies/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Supplies fetched:', response.data)
    return Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('❌ Failed to fetch supplies:', err)
    return []
  }
}

export async function addSupply(data) {
  const token = localStorage.getItem('token')
  console.log('➕ Adding new supply with data:', data)

  try {
    const response = await axios.post(`${API}/supplies`, data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Supply added:', response.data)
    return response.data
  } catch (err) {
    console.error('❌ Failed to add supply:', err)
    throw err
  }
}

export async function updateSupply(id, updatedData) {
  const token = localStorage.getItem('token')
  console.log(`✏️ Updating supply ${id} with data:`, updatedData)

  try {
    const response = await axios.put(`${API}/supplies/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Supply updated:', response.data)
    return response.data
  } catch (err) {
    console.error(`❌ Failed to update supply ${id}:`, err)
    throw err
  }
}

export async function deleteSupply(id) {
  const token = localStorage.getItem('token')
  console.log(`🗑️ Deleting supply ${id}`)

  try {
    const response = await axios.delete(`${API}/supplies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    console.log('✅ Supply deleted:', response.data)
    return response.data
  } catch (err) {
    console.error(`❌ Failed to delete supply ${id}:`, err)
    throw err
  }
}

// ✅ NEW: Get breakdown of assigned quantities by operatory
export async function fetchAssignedBreakdown(supplyId) {
  const token = localStorage.getItem('token')
  const endpoint = `${API}/supplies/assigned-details/${supplyId}`

  console.log(`🔍 Fetching assigned breakdown for supply ${supplyId}`)
  console.log('➡️ Request URL:', endpoint)
  console.log('🔐 Auth Token Present:', !!token)

  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })

    console.log(`✅ Breakdown fetched for supply ${supplyId}:`, response.data)
    return response.data
  } catch (err) {
    if (err.response) {
      console.error(`❌ Server responded with ${err.response.status}:`, err.response.data)
    } else if (err.request) {
      console.error(`❌ No response received for supply ${supplyId}:`, err.request)
    } else {
      console.error(`❌ Error setting up request for supply ${supplyId}:`, err.message)
    }
    return []
  }
}
