// /client/src/components/WelcomeCard.jsx
import { Paper, Typography } from '@mui/material'

export default function WelcomeCard({ practiceName }) {
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Welcome, {practiceName}!
      </Typography>
      <Typography>
        Use the dashboard to manage your ops, supplies, usage logs, and more.
      </Typography>
    </Paper>
  )
}
