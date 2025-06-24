import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

// ✅ Use Vite's environment variable for the API base URL
const BASE_URL = import.meta.env.VITE_API_URL

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      navigate('/dashboard-page')
    } catch (err) {
      alert('Login failed')
      console.error(err)
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Log In to Your Practice
        </Typography>

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />

        {/* ✅ Forgot Password link */}
        <Box textAlign="right" mt={1}>
          <Link component={RouterLink} to="/forgot-password" underline="hover">
            Forgot Password?
          </Link>
        </Box>

        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Link component={RouterLink} to="/register" underline="hover">
            Don&apos;t have an account? Register here.
          </Link>
        </Box>
      </Paper>
    </Container>
  )
}
