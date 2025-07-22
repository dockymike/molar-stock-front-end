// src/pages/ForgotPasswordPage.jsx
import AuthFormWrapper from '../components/Auth/AuthFormWrapper'
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm'
import useCustomSnackbar from '../components/Common/useSnackBar'
import { requestPasswordReset } from '../services/passwordService' // ✅ Make sure this path matches your project

export default function ForgotPasswordPage() {
  const { showSuccess, showError } = useCustomSnackbar()

  const handleForgotPassword = async ({ email }) => {
    try {
      await requestPasswordReset(email)
      showSuccess('If an account exists, a reset link has been sent.')
    } catch (err) {
      console.error('❌ Forgot password error:', err)
      showError('Failed to send reset link. Please try again later.')
    }
  }

  return (
    <AuthFormWrapper title="Reset Your Password">
      <ForgotPasswordForm onSubmit={handleForgotPassword} />
    </AuthFormWrapper>
  )
}
