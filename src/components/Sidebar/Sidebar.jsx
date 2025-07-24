// src/components/Sidebar/Sidebar.jsx
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import InventoryIcon from '@mui/icons-material/Inventory2'
import CategoryIcon from '@mui/icons-material/Category'
import StoreIcon from '@mui/icons-material/Store'
import HistoryIcon from '@mui/icons-material/History'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LogoutIcon from '@mui/icons-material/Logout'

import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'

const drawerWidth = 240

export default function Sidebar() {
  const theme = useTheme()
  const mode = theme.palette.mode
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useUser()
  const [open, setOpen] = useState(true)

  const toggleSidebar = () => setOpen((prev) => !prev)

  const getItemStyles = (path) => {
    const isActive = location.pathname.startsWith(path)
    return {
      backgroundColor: isActive
        ? theme.palette.sidebarHighlight || (mode === 'light' ? '#FFF3E0' : '#2A2A2A')
        : 'transparent',
      color: isActive
        ? mode === 'light'
          ? '#F57C00'
          : '#90CAF9'
        : 'inherit',
      borderRight: isActive ? `4px solid ${mode === 'light' ? '#F57C00' : '#90CAF9'}` : 'none',
      fontWeight: isActive ? 'bold' : 'normal',
      '&:hover': {
        backgroundColor: mode === 'light' ? '#FFE0B2' : '#333',
      },
    }
  }

  const menuItems = [
    { label: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { label: 'Locations', icon: <LocationOnIcon />, path: '/locations' },
    { label: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { label: 'Suppliers', icon: <StoreIcon />, path: '/suppliers' },
  ]

  const secondaryItems = [
    { label: 'Logs', icon: <HistoryIcon />, path: '/invoice', disabled: true },
    {
      label: 'User Management',
      icon: <AdminPanelSettingsIcon />,
      path: '/users',
      disabled: true,
    },
    {
      label: 'Help',
      icon: <HelpOutlineIcon />,
      path: '/help',
      disabled: true,
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      disabled: true,
    },
  ]

  const renderList = (items) => (
    <List>
      {items.map(({ label, icon, path, disabled }) => (
        <ListItemButton
          key={label}
          onClick={() => !disabled && navigate(path)}
          disabled={disabled}
          sx={getItemStyles(path)}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
          {open && <ListItemText primary={label} />}
        </ListItemButton>
      ))}
    </List>
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

return (
  <>
    {/* Sidebar Drawer */}
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 60,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? drawerWidth : 60,
          transition: 'width 0.2s',
          boxSizing: 'border-box',
          p: 2,
          overflowX: 'hidden',
          position: 'relative',
        },
      }}
    >
      <Box>
        {open && (
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🟧 Molar Stock
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />
        {renderList(menuItems)}
        <Divider sx={{ my: 2 }} />
        {renderList(secondaryItems)}
        <Divider sx={{ my: 2 }} />

        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: 'error.main',
            mt: 1,
            '&:hover': {
              backgroundColor: mode === 'light' ? '#FFEBEE' : '#4B0000',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Logout" />}
        </ListItemButton>
      </Box>

      {/* Collapse Button (Positioned outside) */}
<Box
  onClick={toggleSidebar}
  sx={{
    position: 'fixed',
    top: '50%',
    left: open ? `${drawerWidth - 1}px` : '60px',
    transform: 'translateY(-50%)',
    background: 'linear-gradient(to right, #FFF9C4, #FFEB3B)', // yellow tone
    color: '#333',
    border: '1px solid #FDD835',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
    zIndex: 1301,
    cursor: 'pointer',
    px: 0.5,
    py: 0.25,
    fontSize: 12,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    transition: 'left 0.2s ease-in-out, background 0.2s',
    minWidth: '18px',
    minHeight: '60px',
    animation: 'pulse 2s infinite',
    '&:hover': {
      background: '#FFF176', // hover yellow
    },
    '@keyframes pulse': {
      '0%': {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
      },
      '50%': {
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
      },
      '100%': {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
      },
    },
  }}
>
  <Typography
    sx={{
      writingMode: 'vertical-rl',
      transform: 'rotate(180deg)',
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 1.1,
    }}
  >
    {open ? 'Collapse Sidebar' : 'Expand Sidebar'}
  </Typography>
</Box>





    </Drawer>
  </>
)

}
