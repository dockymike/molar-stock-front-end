// src/App.jsx
import { useTheme } from '@mui/material'
import { Box } from '@mui/material'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useUser } from './context/UserContext'
import { useColorMode } from './theme/useColorMode'

// Layout
import Sidebar from './components/Sidebar/Sidebar'
import Topbar from './components/Topbar/Topbar'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

// Main Pages (no lazy loading for better UX)
import InventoryPage from './pages/InventoryPage'
import LocationsPage from './pages/LocationsPage'
import CategoriesPage from './pages/CategoriesPage'
import SuppliersPage from './pages/SuppliersPage'

// Auth
import ProtectedRoute from './components/Auth/ProtectedRoute'



export default function App() {
  const theme = useTheme()
  const location = useLocation()
  const { user } = useUser()
  const { setMode } = useColorMode()

  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ]
  const isAuthRoute = publicRoutes.includes(location.pathname)

  // Sync dark mode based on user context
  useEffect(() => {
    if (user?.dark_mode !== undefined) {
      setMode(user.dark_mode ? 'dark' : 'light')
    }
  }, [user, setMode])

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    )
  }

  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            width: 'calc(100% - 240px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Topbar />
          <Box
            sx={{
              flexGrow: 1,
              p: 3,
              overflowY: 'auto',
              bgcolor: theme.palette.background.default,
            }}
          >
            <Routes>
              {/* Protected Routes */}
              <Route path="/" element={<InventoryPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/locations" element={<LocationsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ProtectedRoute>
  )
}
