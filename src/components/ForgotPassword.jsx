import { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material'
import { requestPasswordReset } from '../services/PasswordService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ success: null, message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('📨 Form submitted')
    console.log('📧 Email submitted:', email)

    if (!email) {
      console.warn('⚠️ Empty email submitted. Ignoring request.')
      setStatus({ success: false, message: 'Please enter your email.' })
      return
    }

    try {
      console.log('🚀 Initiating password reset request...')
      const data = await requestPasswordReset(email)

      console.log('✅ API call successful')
      console.log('📬 API Response Data:', data)

      setStatus({
        success: true,
        message: data.message || 'Reset link sent.',
      })
    } catch (err) {
      console.error('❌ Reset request failed in ForgotPassword:', err)
      if (err?.response) {
        console.error('📡 Server responded with:', err.response.status)
        console.error('📄 Server error message:', err.response.data)
      } else if (err?.request) {
        console.error('📭 Request was made but no response:', err.request)
      } else {
        console.error('⚠️ Error setting up the request:', err.message)
      }

      setStatus({
        success: false,
        message: 'Something went wrong. Please try again.',
      })
    }
  }

  const handleEmailChange = (e) => {
    console.log('✏️ Email input changed:', e.target.value)
    setEmail(e.target.value)
  }

  const handleSnackbarClose = () => {
    console.log('ℹ️ Snackbar dismissed')
    setStatus({ success: null, message: '' })
  }

  const handleClickButton = () => {
    console.log('🖱️ Send Reset Link button clicked')
  }

  return (
    <Box p={3} maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>Forgot Password</Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Enter your email"
          fullWidth
          value={email}
          onChange={handleEmailChange}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          onClick={handleClickButton}
        >
          Send Reset Link
        </Button>
      </form>

      <Snackbar
        open={!!status.message}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={status.success ? 'success' : 'error'}>
          {status.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
