// src/components/Auth/AuthFormWrapper.jsx
import { Box, Paper, Typography } from '@mui/material'

export default function AuthFormWrapper({ title, children }) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          {title}
        </Typography>
        {children}
      </Paper>
    </Box>
  )
}
