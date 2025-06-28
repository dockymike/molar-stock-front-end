export default function DashboardPage() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      textAlign="center"
      p={4}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500 }}>
        <Typography variant="h5" gutterBottom>
          🚧 Software is currently updating
        </Typography>
        <Typography variant="body1">
          Please check back later. Expected update release: <strong>07/01/25</strong>
        </Typography>
      </Paper>
    </Box>
  )
}
