// src/components/Auth/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useUser } from '../../context/UserContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useUser()
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }
  
  // Check for authentication status and user data
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return children
}
