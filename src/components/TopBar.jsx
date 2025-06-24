// /client/src/components/TopBar.jsx
import { AppBar, Toolbar, Typography, Button } from '@mui/material'

export default function TopBar({ practiceName, onLogout }) {
  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">{practiceName}</Typography>
        <Button color="inherit" onClick={onLogout}>Logout</Button>
      </Toolbar>
    </AppBar>
  )
}
