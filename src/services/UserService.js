import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function fetchUserById(userId) {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get(`${API}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    console.error('Failed to fetch user:', err)
    return null
  }
}
