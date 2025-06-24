import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL
const getToken = () => localStorage.getItem('token')

// ✅ Update GLOBAL low stock threshold
export const updateGlobalLowStockThreshold = async (supplyId, threshold) => {
  console.log('🌐 Updating GLOBAL low stock threshold')
  console.log('➡️ Supply ID:', supplyId, 'Threshold:', threshold)

  try {
    const res = await axios.patch(
      `${BASE_URL}/low-stock-threshold/global/${supplyId}`,
      { low_stock_threshold: threshold },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    console.log('✅ Global threshold update successful:', res.data)
    return res.data
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to update global threshold'
    console.error('❌ Global update error:', message)
    throw new Error(message)
  }
}

// ✅ Update OPERATORY low stock threshold
export const updateOperatoryLowStockThreshold = async (opSupplyId, threshold) => {
  console.log('🏥 Updating OPERATORY low stock threshold')
  console.log('➡️ OpSupply ID:', opSupplyId, 'Threshold:', threshold)

  try {
    const res = await axios.patch(
      `${BASE_URL}/low-stock-threshold/operatory/${opSupplyId}`,
      { low_stock_threshold: threshold },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
    console.log('✅ Operatory threshold update successful:', res.data)
    return res.data
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to update operatory threshold'
    console.error('❌ Operatory update error:', message)
    throw new Error(message)
  }
}

// ✅ Get all thresholds
export const getAllLowStockThresholds = async () => {
  console.log('📥 Fetching all low stock thresholds')

  try {
    const res = await axios.get(`${BASE_URL}/low-stock-threshold/all`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    console.log('✅ Thresholds fetched:', res.data)
    return res.data
  } catch (err) {
    const message = err.response?.data?.error || 'Failed to fetch thresholds'
    console.error('❌ Fetch error:', message)
    throw new Error(message)
  }
}
