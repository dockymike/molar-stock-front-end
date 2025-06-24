import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function fetchSuppliers(userId, token) {
  try {
    const res = await axios.get(`${API}/suppliers/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to fetch suppliers:', err)
    return []
  }
}

export async function addSupplier(data) {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${API}/suppliers`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateSupplier(id, updatedData) {
  const token = localStorage.getItem('token')
  const res = await axios.put(`${API}/suppliers/${id}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteSupplier(id) {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${API}/suppliers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
