// ✅ src/services/LocationService.js
import api from './api.jsx'

export const fetchLocations = async () => {
  try {
    const res = await api.get('/locations')
    return Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('❌ Failed to fetch locations:', error)
    return []
  }
}

export const addLocation = async (name) => {
  const res = await api.post('/locations', { name })
  return res.data
}

export const updateLocation = async (id, data) => {
  const res = await api.put(`/locations/${id}`, data)
  return res.data
}

export const deleteLocation = async (id) => {
  const res = await api.delete(`/locations/${id}`)
  return res.data
}
