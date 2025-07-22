// src/components/Auth/LoginForm.jsx
import { useState } from 'react'
import { TextField, Button, Stack, Typography, Link, Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function LoginForm({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Please fill in all fields') // Consider lifting this up to parent if centralizing
      return
    }

    onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <Box display="flex" justifyContent="flex-end">
          <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2">
            Forgot password?
          </Link>
        </Box>

        <Button type="submit" variant="contained" fullWidth>
          Login
        </Button>

        <Typography variant="body2" align="center">
          Don’t have an account?{' '}
          <Link component={RouterLink} to="/register">
            Register here
          </Link>
        </Typography>
      </Stack>
    </form>
  )
}

