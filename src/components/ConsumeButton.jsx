// /client/src/components/ConsumeButton.jsx
import { useState } from 'react'
import { Button, Modal, Box, Typography } from '@mui/material'

export default function ConsumeButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Consume
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Log Supply Usage
          </Typography>
          {/* Add form inputs here later */}
        </Box>
      </Modal>
    </>
  )
}
