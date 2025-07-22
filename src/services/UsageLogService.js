import api from './api.jsx'

export const fetchLogs = async (userId) => {
  const res = await api.get(`/logs/${userId}`)
  return res.data
}

export const logSupplyUse = async (data) => {
  const res = await api.post(`/logs`, data)
  return res.data
}
