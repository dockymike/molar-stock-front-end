// src/services/AuthService.js
import api from './api.jsx'

// ✅ LOGIN: sends credentials and stores token via httpOnly cookie
export async function login({ email, password }) {
  const res = await api.post(
    '/login',
    { email, password },
    { withCredentials: true } // 🔥 Ensure cookie is accepted and stored
  )
  const { user } = res.data
  return { user }
}

// ✅ REGISTER: unchanged, no cookie needed
export async function register({ email, password, practice_name }) {
  const res = await api.post('/register', { email, password, practice_name })
  return res.data
}
