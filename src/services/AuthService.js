// src/services/AuthService.js
import api from './api.jsx'

export async function login({ email, password }) {
  const res = await api.post('/users/login', { email, password })
  const { user } = res.data
  // JWT token is now stored in httpOnly cookie, only return user data
  return { user }
}

export async function register({ email, password, practice_name }) {
  const res = await api.post('/users/register', { email, password, practice_name })
  return res.data
}
