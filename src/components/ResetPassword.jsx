import { useState } from 'react'
import {
  Box, TextField, Button, Typography, Snackbar, Alert,
} from '@mui/material'
import { useSearchParams, useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [status, setStatus] = useState({ success: null, message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API}/password/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await res.json()
      if (res.ok) {
        setStatus({ success: true, message: 'Password reset successfully. Redirecting to login…' })

        // Wait 2 seconds before redirecting to login
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        setStatus({ success: false, message: data.error || 'Reset failed.' })
      }
    } catch (err) {
      console.error('Reset failed:', err)
      setStatus({ success: false, message: 'Something went wrong.' })
    }
  }

  return (
    <Box p={3} maxWidth={400} mx="auto">
      <Typography variant="h5" gutterBottom>Reset Password</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" fullWidth>Reset</Button>
      </form>
      <Snackbar
        open={!!status.message}
        autoHideDuration={6000}
        onClose={() => setStatus({ success: null, message: '' })}
      >
        <Alert severity={status.success ? 'success' : 'error'}>
          {status.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
