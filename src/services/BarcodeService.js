// src/services/BarcodeService.js

import api from './api.jsx'

// Lookup barcode
export async function lookupBarcode(barcode) {
  try {
    const response = await api.get(`/barcode/lookup/${barcode}`)
    return response.data // ✅ No comma here
  } catch (err) {
    throw err
  }
}

// Add new item by barcode
export async function addItemByBarcode({ barcode, name, quantity, location }) {
  try {
    const payload = {
      method: 'add',
      location,
      entryType: 'scan',
      scanMode: 'single',
      quantity,
      supplies: [
        {
          isNew: true,
          name,
          quantity,
          barcode,
          location_id: location,
        },
      ],
    }

    const response = await api.post('/inventory/add', payload)

    if (response && response.data) {
      return {
        ...response.data,
        name, // ✅ inject name manually
      }
    } else {
      throw new Error('Empty response from server')
    }
  } catch (err) {
    console.error('Failed to add item by barcode:', err?.response?.data || err.message)
    throw err
  }
}
