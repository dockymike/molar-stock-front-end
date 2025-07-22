// ✅ src/services/passwordService.js
import api from './api.jsx'

export async function requestPasswordReset(email) {
  const payload = { email }
  return api.post(`/password/request-reset`, payload)
}

// ✅ Add this missing function ⬇️
export async function resetPassword(token, newPassword) {
  const payload = { token, newPassword }
  return api.post(`/password/reset-password`, payload)
}
