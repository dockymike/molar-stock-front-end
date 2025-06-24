// 📁 src/services/LowStockThresholdService.js
import axios from 'axios'

const API = import.meta.env.VITE_API_URL


export async function fetchLowStockAlerts(userId) {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get(`${API}/low-stock/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Error fetching low stock alerts:', err)
    return []
  }
}
