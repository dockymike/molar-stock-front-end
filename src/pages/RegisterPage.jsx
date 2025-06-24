import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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

// ✅ Use Vite env variable for base API URL
const BASE_URL = import.meta.env.VITE_API_URL

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await axios.post(`${BASE_URL}/users/register`, {
        email,
        password,
        practice_name: practiceName,
      })

      const loginRes = await axios.post(`${BASE_URL}/users/login`, {
        email,
        password,
      })

      localStorage.setItem('token', loginRes.data.token)
      localStorage.setItem('user', JSON.stringify(loginRes.data.user))
      navigate('/dashboard-page')
    } catch (err) {
      alert('Registration failed')
      console.error(err)
    }
  }

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Register Your Practice
        </Typography>

        <TextField
          label="Practice Name"
          value={practiceName}
          onChange={(e) => setPracticeName(e.target.value)}
          fullWidth
          margin="normal"
        />
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
        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={handleRegister}>
            Register
          </Button>
        </Box>
        <Box textAlign="center" mt={2}>
          <Link component={RouterLink} to="/" underline="hover">
            Already have an account? Login here.
          </Link>
        </Box>
      </Paper>
    </Container>
  )
}
