// ✅ src/services/SuppliesService.js
import api from './api.jsx'

// ✅ Fetch supplies
export async function fetchSupplies(sortBy = '') {
  const url = `/supplies${sortBy ? `?sortBy=${sortBy}` : ''}`

  try {
    const response = await api.get(url)
    return Array.isArray(response.data) ? response.data : []
  } catch (err) {
    return []
  }
}

// ✅ Add a new supply
export async function addSupply(data) {
  try {
    const response = await api.post(`/supplies`, data)
    return response.data
  } catch (err) {
    throw err
  }
}

// ✅ Update a supply by ID
export async function updateSupply(id, updatedData) {
  try {
    const response = await api.put(`/supplies/${id}`, updatedData)
    return response.data
  } catch (err) {
    throw err
  }
}

// ✅ Delete a supply by ID
export async function deleteSupply(id) {
  try {
    const response = await api.delete(`/supplies/${id}`)
    return response.data
  } catch (err) {
    throw err
  }
}

// ✅ Get assigned breakdown by operatory for a supply
export async function fetchAssignedBreakdown(supplyId) {
  try {
    const response = await api.get(`/supplies/assigned-details/${supplyId}`)
    return response.data
  } catch (err) {
    return []
  }
}

// ✅ Fetch full supply list with operatories
export async function fetchSuppliesFull(sortBy = '') {
  const url = `/supplies/full${sortBy ? `?sortBy=${sortBy}` : ''}`

  try {
    const response = await api.get(url)
    return Array.isArray(response.data) ? response.data : []
  } catch (err) {
    return []
  }
}
