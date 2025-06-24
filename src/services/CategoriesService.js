import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function fetchCategories(userId) {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get(`${API}/categories/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to fetch categories:', err)
    return []
  }
}

export async function createCategory(data) {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${API}/categories`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function updateCategory(id, data) {
  const token = localStorage.getItem('token')
  const res = await axios.put(`${API}/categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export async function deleteCategory(id) {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${API}/categories/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
