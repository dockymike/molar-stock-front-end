import axios from 'axios' // ← ✅ ADD THIS LINE

const BASE_URL = import.meta.env.VITE_API_URL

export const fetchLogs = async (userId, token) => {
  const res = await axios.get(`${BASE_URL}/logs/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const logSupplyUse = async (data) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${BASE_URL}/logs`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}
