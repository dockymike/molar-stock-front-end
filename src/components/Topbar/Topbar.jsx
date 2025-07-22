// src/components/Topbar/Topbar.jsx
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useTheme,
  Badge,
} from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import DarkModeToggle from '../Common/DarkModeToggle'
import { useState, useEffect } from 'react' // <-- ✅ Add useEffect here
import LowStockModal from '../Modals/LowStockModal'
import { useLowStock } from '../../context/LowStockContext'
import { useUser } from '../../context/UserContext'



export default function Topbar() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  
  const { lowStockAlerts } = useLowStock()
  useEffect(() => {
    console.log('🎯 Topbar sees alerts:', lowStockAlerts)
  }, [lowStockAlerts])


  const { user } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const practiceName = user?.practice_name || 'Practice'

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${isDark ? theme.palette.divider : '#eee'}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box /> {/* Placeholder for spacing balance */}

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DarkModeToggle />
          <IconButton
            onClick={() => setIsModalOpen(true)}
            sx={{ color: theme.palette.text.primary }}
          >
            <Badge badgeContent={lowStockAlerts.length} color="error">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
          <AccountCircleIcon fontSize="large" />
          <Typography variant="body2" fontWeight={600}>
            {practiceName}
          </Typography>
        </Box>
      </Toolbar>

      <LowStockModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        alerts={lowStockAlerts}
      />
    </AppBar>
  )
}

