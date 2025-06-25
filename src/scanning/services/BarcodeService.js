import axios from 'axios'
const API = import.meta.env.VITE_API_URL

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
})

export const lookupBarcode = async (barcode) =>
  (await axios.get(`${API}/barcode/${barcode}`, auth())).data

export const assignBarcodeToSupply = async (supply_id, barcode) =>
  (await axios.post(`${API}/barcode/assign`, { supply_id, barcode }, auth())).data

export const createSupplyWithBarcode = async (data) =>
  (await axios.post(`${API}/barcode/create`, data, auth())).data

export const checkInSupply = async ({ supply_id, quantity, op_id }) =>
  (await axios.post(`${API}/barcode/checkin`, { supply_id, quantity, op_id }, auth())).data

export const consumeSupply = async ({ supply_id, quantity, op_id }) =>
  (await axios.post(`${API}/barcode/consume`, { supply_id, quantity, op_id }, auth())).data
