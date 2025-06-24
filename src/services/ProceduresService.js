// ✅ Fixed: src/services/ProceduresService.js
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

export const fetchProcedures = async (userId) => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${BASE_URL}/procedures/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const addProcedure = async (data) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${BASE_URL}/procedures`, data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const addSupplyToProcedure = async ({ procedure_id, supply_id, quantity }) => {
  const token = localStorage.getItem('token')
  const res = await axios.post(`${BASE_URL}/procedure-supplies`, {
    procedure_id,
    supply_id,
    quantity,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const fetchSuppliesForProcedure = async (procedureId) => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${BASE_URL}/procedure-supplies/${procedureId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const deleteSupplyFromProcedure = async (id) => {
  const token = localStorage.getItem('token') // ✅ Missing before
  const res = await axios.delete(`${BASE_URL}/procedure-supplies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateProcedureSupplyQuantity = async (supplyRowId, quantity) => {
  const token = localStorage.getItem('token') // ✅ Missing before
  const res = await axios.put(`${BASE_URL}/procedure-supplies/${supplyRowId}`, { quantity }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const deleteProcedure = async (procedureId) => {
  const token = localStorage.getItem('token')
  const res = await axios.delete(`${BASE_URL}/procedures/${procedureId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

export const updateProcedureName = async (procedureId, newName) => {
  const token = localStorage.getItem('token')
  const res = await axios.put(`${BASE_URL}/procedures/${procedureId}`, {
    name: newName,
  }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data
}

