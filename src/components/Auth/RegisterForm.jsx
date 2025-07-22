// src/components/Auth/RegisterForm.jsx
import { useState } from 'react'
import { TextField, Button, Stack, Typography, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function RegisterForm({ onSubmit }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [practiceName, setPracticeName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!email || !password || !confirmPassword || !practiceName) {
      alert('Please fill in all fields')
      return
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    
    onSubmit({ email, password, practice_name: practiceName })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Practice Name"
          value={practiceName}
          onChange={(e) => setPracticeName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
        />

        <Button type="submit" variant="contained" fullWidth>
          Register
        </Button>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Login here
          </Link>
        </Typography>
      </Stack>
    </form>
  )
}
