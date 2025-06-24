// 📁 src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Tooltip,
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

// Components
import TopBar from '../components/TopBar'
import DonationBar from '../components/DonationBar'
import Operatories from '../components/Operatories'
import Supplies from '../components/Supplies'
import Categories from '../components/Categories'
import Suppliers from '../components/Suppliers'
import UsageLog from '../components/UsageLog'
import AssignSupplyToOperatory from '../components/AssignSupplyToOperatory'
import Procedures from '../components/Procedures'
import ConsumeModal from '../components/ConsumeModal'
import CheckInModal from '../components/CheckInModal'
import LowStockThreshold from '../components/LowStockThreshold'
import { fetchUserById } from '../services/UserService'

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [tabIndex, setTabIndex] = useState(0)
  const [isConsumeOpen, setIsConsumeOpen] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) {
      console.warn('🚫 No user found in localStorage. Redirecting to login.')
      navigate('/')
      return
    }

    console.log('📦 Loaded user from localStorage:', user)

    const params = new URLSearchParams(location.search)
    const isSuccess = params.get('checkout') === 'success'

    if (isSuccess && user?.id) {
      console.log('✅ Checkout success detected. Refetching user from DB...')
      const token = localStorage.getItem('token')
      fetchUserById(user.id, token).then((updatedUser) => {
        if (updatedUser) {
          console.log('🆕 Updated user fetched from DB:', updatedUser)
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))

          // Optional: force refresh to update UI state like DonationBar
          window.location.href = '/dashboard-page'
        } else {
          console.error('❌ Failed to fetch updated user after checkout.')
        }
      })
    }
  }, [user, navigate, location.search])

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const handleTabChange = (_, newValue) => setTabIndex(newValue)
  const handleSupplyChange = () => setRefreshKey((prev) => prev + 1)

  const tabLabels = [
    {
      label: 'Suppliers',
      description: 'Manage supplier contact info for order tracking and reordering.',
    },
    {
      label: 'Operatories',
      description:
        'Track which supplies and their quantities are assigned to each operatory. Set low supply threshold alerts for individual supplies in the operatory.',
    },
    {
      label: 'Categories',
      description: 'Organize your supplies into categories like gloves, anesthetic, etc.',
    },
    {
      label: 'Global Supplies',
      description:
        'View and manage total inventory of all supplies available in your practice. Set price per units to track expenses and set low supply threshold alerts on a global level.',
    },
    {
      label: 'Send Supplies to Operatory',
      description: 'Distribute items from global inventory into individual operatories.',
    },
    {
      label: 'Procedures',
      description: 'Define procedures and assign default supply quantities for each for quick consumption.',
    },
    {
      label: 'Usage Logs',
      description: 'Track when and where supplies were used across your office and cost of supplies per procedure.',
    },
  ]

  return (
    <>
      {/* 🔷 Header */}
      <TopBar
        practiceName={user?.practice_name || 'Dental Inventory'}
        onLogout={handleLogout}
      />

      {/* 💸 Donation Banner */}
      <DonationBar />

      {/* ✅ Action Buttons & Low Stock Alerts */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        px={4}
        py={2}
        sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}
      >
        {/* ➕ Action Buttons */}
        <Box display="flex" gap={4}>
          {/* Consume */}
          <Box display="flex" flexDirection="column" alignItems="center">
            <Tooltip
              title={
                <Typography fontSize={14}>
                  Log which supplies were used in each operatory and update inventory accordingly.
                </Typography>
              }
              arrow
            >
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <HelpOutlineIcon fontSize="small" sx={{ color: '#FFD700' }} />
                <Typography variant="caption">Consume Supplies</Typography>
              </Box>
            </Tooltip>
            <Button variant="contained" color="primary" onClick={() => setIsConsumeOpen(true)}>
              + CONSUME SUPPLIES
            </Button>
          </Box>

          {/* Check-In */}
          <Box display="flex" flexDirection="column" alignItems="center">
            <Tooltip
              title={
                <Typography fontSize={14}>
                  Receive new inventory or restock existing items into the global inventory.
                </Typography>
              }
              arrow
            >
              <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                <HelpOutlineIcon fontSize="small" sx={{ color: '#FFD700' }} />
                <Typography variant="caption">Check-In Supplies</Typography>
              </Box>
            </Tooltip>
            <Button variant="contained" color="secondary" onClick={() => setIsCheckInOpen(true)}>
              + CHECK-IN SUPPLIES
            </Button>
          </Box>
        </Box>

        {/* 🔔 Low Stock Alerts */}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Tooltip
            title={
              <Typography fontSize={14}>
                View which supplies are below their assigned low stock threshold and need to be restocked.
              </Typography>
            }
            arrow
          >
            <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
              <HelpOutlineIcon fontSize="small" sx={{ color: '#FFD700' }} />
              <Typography variant="caption"></Typography>
            </Box>
          </Tooltip>
          <LowStockThreshold refreshKey={refreshKey} />
        </Box>
      </Box>

      {/* 📋 Main Dashboard Content */}
      <Box px={4} mt={4}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user?.practice_name}!
          </Typography>
          <Typography gutterBottom>
            Use the dashboard to manage your operatories, supplies, categories, suppliers, and usage logs.
          </Typography>

          {/* 🔖 Tabs */}
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mt: 2, mb: 2 }}>
            {tabLabels.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {tab.label}
                    <Tooltip
                      title={<Typography fontSize={14}>{tab.description}</Typography>}
                      arrow
                      placement="top"
                    >
                      <HelpOutlineIcon fontSize="small" sx={{ color: '#FFD700' }} />
                    </Tooltip>
                  </Box>
                }
              />
            ))}
          </Tabs>

          {/* 🧩 Tab Content */}
          {tabIndex === 0 && <Suppliers />}
          {tabIndex === 1 && <Operatories onSupplyChange={handleSupplyChange} />}
          {tabIndex === 2 && <Categories />}
          {tabIndex === 3 && <Supplies onSupplyChange={handleSupplyChange} />}
          {tabIndex === 4 && <AssignSupplyToOperatory />}
          {tabIndex === 5 && <Procedures />}
          {tabIndex === 6 && <UsageLog />}
        </Paper>
      </Box>

      {/* 📦 Modals */}
      <ConsumeModal
        open={isConsumeOpen}
        onClose={() => setIsConsumeOpen(false)}
        onSupplyChange={handleSupplyChange}
      />
      <CheckInModal
        open={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSupplyChange={handleSupplyChange}
      />
    </>
  )
}
