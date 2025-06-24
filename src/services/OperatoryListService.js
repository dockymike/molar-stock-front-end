import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_URL

export const fetchOperatories = async (userId) => {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get(`${BASE_URL}/ops/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to fetch operatories:', err)
    return []
  }
}

export const addOperatory = async (data) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${BASE_URL}/ops`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateOperatory = async (id, data) => {
  const token = localStorage.getItem('token')
  const res = await axios.put(`${BASE_URL}/ops/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const deleteOperatory = async (id) => {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${BASE_URL}/ops/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
