// ✅ Fixed: src/services/ProceduresService.js
import api from './api.jsx'

export const fetchProcedures = async (userId) => {
  const res = await api.get(`/procedures/${userId}`)
  return res.data
}

export const addProcedure = async (data) => {
  const res = await api.post(`/procedures`, data)
  return res.data
}

export const addSupplyToProcedure = async ({ procedure_id, supply_id, quantity }) => {
  const res = await api.post(`/procedure-supplies`, {
    procedure_id,
    supply_id,
    quantity,
  })
  return res.data
}

export const fetchSuppliesForProcedure = async (procedureId) => {
  const res = await api.get(`/procedure-supplies/${procedureId}`)
  return res.data
}

export const deleteSupplyFromProcedure = async (id) => {
  const res = await api.delete(`/procedure-supplies/${id}`)
  return res.data
}

export const updateProcedureSupplyQuantity = async (supplyRowId, quantity) => {
  const res = await api.put(`/procedure-supplies/${supplyRowId}`, { quantity })
  return res.data
}

export const deleteProcedure = async (procedureId) => {
  const res = await api.delete(`/procedures/${procedureId}`)
  return res.data
}

export const updateProcedureName = async (procedureId, newName) => {
  const res = await api.put(`/procedures/${procedureId}`, {
    name: newName,
  })
  return res.data
}

