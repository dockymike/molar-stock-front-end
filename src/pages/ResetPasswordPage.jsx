// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material'
import useCustomSnackbar from '../components/Common/useSnackBar'
import { resetPassword } from '../services/passwordService'
import AuthFormWrapper from '../components/Auth/AuthFormWrapper'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  const { showSuccess, showError } = useCustomSnackbar()
  const navigate = useNavigate()

  // Token check on page load
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      showError('Reset link is missing or invalid.')
    }
  }, [token, showError])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      showError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, newPassword)
      showSuccess('Password updated! You may now log in.')
      navigate('/login')
    } catch (err) {
      const message =
        err?.response?.data?.error || 'Failed to reset password.'
      showError(message)

      if (
        message.toLowerCase().includes('expired') ||
        message.toLowerCase().includes('invalid')
      ) {
        setTokenValid(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <AuthFormWrapper title="Reset Link Invalid or Expired">
        <Typography variant="body1">
          This reset link is either missing or expired. Please{' '}
          <a href="/forgot-password" style={{ color: '#1976d2' }}>
            request a new one
          </a>
          .
        </Typography>
      </AuthFormWrapper>
    )
  }

  return (
    <AuthFormWrapper title="Set New Password">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="body1" gutterBottom>
          Enter a new password below.
        </Typography>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
      </Box>
    </AuthFormWrapper>
  )
}
