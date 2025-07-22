// src/components/Auth/ForgotPasswordForm.jsx
import { useState } from 'react'
import { TextField, Button, Stack, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function ForgotPasswordForm({ onSubmit }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      alert('Please enter your email') // You can move this to parent for snackbar control
      return
    }

    onSubmit({ email })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Typography variant="h6" align="center">
          Forgot your password?
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary">
          Enter your email and we’ll send you a reset link.
        </Typography>

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" fullWidth>
          Send Reset Link
        </Button>

        <Typography variant="body2" align="center">
          Remembered it?{' '}
          <Link component={RouterLink} to="/login">
            Back to login
          </Link>
        </Typography>
      </Stack>
    </form>
  )
}

