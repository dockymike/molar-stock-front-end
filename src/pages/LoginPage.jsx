// src/pages/LoginPage.jsx
import { useNavigate } from 'react-router-dom'
import AuthFormWrapper from '../components/Auth/AuthFormWrapper'
import LoginForm from '../components/Auth/LoginForm'
import useCustomSnackbar from '../components/Common/useSnackBar'
import { login } from '../services/AuthService'
import { useUser } from '../context/UserContext'

export default function LoginPage() {
  const { showSuccess, showError } = useCustomSnackbar()
  const navigate = useNavigate()
  const { login: loginContext } = useUser()

  const handleLogin = async ({ email, password }) => {
    if (!email || !password) {
      showError('Please fill in all fields')
      return
    }

    try {
      const { user } = await login({ email, password })

      // Use UserContext to store the login state
      loginContext(user)

      // 🌙 Apply dark mode if user preference exists
      if (user?.dark_mode !== undefined) {
        document.dispatchEvent(
          new CustomEvent('theme-updated', {
            detail: user.dark_mode ? 'dark' : 'light',
          })
        )
      }

      showSuccess('Login successful!')
      navigate('/inventory')
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed'
      showError(message)
    }
  }

  return (
    <AuthFormWrapper title="Login to Molar Stock">
      <div style={{ marginBottom: '1rem', color: '#d32f2f', fontSize: '0.9rem' }}>
        ⚠️ You may experience login issues on Apple devices. If so, please try logging in from a non-Apple device.
      </div>
      <LoginForm onSubmit={handleLogin} />
    </AuthFormWrapper>
  )
}
