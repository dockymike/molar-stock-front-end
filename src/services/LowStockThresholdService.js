// 📁 src/services/LowStockThresholdService.js
import api from './api.jsx'

export async function fetchLowStockAlerts() {
  try {
    const res = await api.get('/low-stock/below-threshold')

    console.log('🧪 Full API response:', res)
    console.log('📦 Response data:', JSON.stringify(res.data, null, 2))

    // If backend returns anything other than an array, fallback to empty
    return Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('❌ Error fetching low stock alerts:', err?.response?.data || err)

    // Log if it was an auth error
    if (err?.response?.status === 401) {
      console.warn('⚠️ Unauthorized — possible login/token issue')
    }

    return []
  }
}
