// src/pages/RegisterPage.jsx
import { useNavigate } from 'react-router-dom'
import AuthFormWrapper from '../components/Auth/AuthFormWrapper'
import RegisterForm from '../components/Auth/RegisterForm'
import useCustomSnackbar from '../components/Common/useSnackBar'
import { register } from '../services/AuthService'

export default function RegisterPage() {
  const { showSuccess, showError } = useCustomSnackbar()
  const navigate = useNavigate()

  const handleRegister = async ({ email, password, practice_name }) => {
    if (!email || !password || !practice_name) {
      showError('Please fill in all fields')
      return
    }

    try {
      await register({ email, password, practice_name })
      showSuccess('Account created successfully! You can now log in.')
      navigate('/login')
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed'
      showError(message)
    }
  }

  return (
    <AuthFormWrapper title="Create an Account">
      <RegisterForm onSubmit={handleRegister} />
    </AuthFormWrapper>
  )
}
