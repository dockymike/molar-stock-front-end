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
  useTheme,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import DisabledSidebarItem from '../Common/DisabledSidebarItem'

// Icon Imports
import InventoryIcon from '@mui/icons-material/Inventory2'
import CategoryIcon from '@mui/icons-material/Category'
import StoreIcon from '@mui/icons-material/Store'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import HistoryIcon from '@mui/icons-material/History'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const drawerWidth = 240

const mainMenu = [
  { label: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { label: 'Locations', icon: <LocationOnIcon />, path: '/locations' }, // ✅ updated
  { label: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { label: 'Suppliers', icon: <StoreIcon />, path: '/suppliers' },
  //{
    //label: 'Transfer Product',
    //icon: <SwapHorizIcon />,
    //path: '/disburse',
    //disabled: true,
    //reason:
    //  'Please use Add Inventory button in the top right corner to transfer from Unassigned to a Location.',
  //},
  //{
   // label: 'Procedures',
    //icon: <MedicalServicesIcon />,
    //path: '/reconciliation',
    //disabled: true,
    //reason: 'Currently disabled. May be deprecated.',
  //},
//
]

const otherMenu = [
  {
    label: 'Logs',
    icon: <HistoryIcon />,
    path: '/invoice',
    disabled: true,
    reason: 'Currently disabled. Coming soon.',
  },
  {
    label: 'User Management',
    icon: <AdminPanelSettingsIcon />,
    path: '/users',
    disabled: true,
    reason:
      'Currently supports one user. Multi-user can be built if it is commonly requested.',
  },
]

const helpMenu = [
  {
    label: 'Help',
    icon: <HelpOutlineIcon />,
    path: '/help',
    disabled: true,
    reason: 'Email contact@molarstock.com',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    disabled: true,
    reason: 'Coming soon',
  },
]


export default function Sidebar() {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useUser()
  const mode = theme.palette.mode

  const getItemStyles = (path) => {
    const isActive = location.pathname.startsWith(path)
    return {
      backgroundColor: isActive
        ? theme.palette.sidebarHighlight ||
          (mode === 'light' ? '#FFF3E0' : '#2A2A2A')
        : 'transparent',
      color: isActive
        ? mode === 'light'
          ? '#F57C00'
          : '#90CAF9'
        : 'inherit',
      borderRight: isActive
        ? `4px solid ${mode === 'light' ? '#F57C00' : '#90CAF9'}`
        : 'none',
      fontWeight: isActive ? 'bold' : 'normal',
      '&:hover': {
        backgroundColor: mode === 'light' ? '#FFE0B2' : '#333',
      },
    }
  }

  const renderList = (items) => (
    <List>
      {items.map((item) => {
        const isDisabled = item.disabled
        if (isDisabled) {
          return (
            <DisabledSidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              reason={item.reason}
            />
          )
        }

        return (
          <ListItemButton
            key={item.label}
            onClick={() => navigate(item.path)}
            sx={getItemStyles(item.path)}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        )
      })}
    </List>
  )

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          p: 2,
        },
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🟧 Molar Stock
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderList(mainMenu)}
        <Divider sx={{ my: 2 }} />
        {renderList(otherMenu)}
        <Divider sx={{ my: 2 }} />
        {renderList(helpMenu)}

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
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Drawer>
  )
}
