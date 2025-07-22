// src/components/Common/ExportButton.jsx
// src/components/Common/ExportButton.jsx
import { Button, Tooltip } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

export default function ExportButton() {
  return (
    <Tooltip
      title="Coming Soon"
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: '1rem', // 👈 Increase as needed (e.g. '1.2rem' or '18px')
            padding: 1,
          },
        },
      }}
    >
      <span>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          disabled
        >
          Export
        </Button>
      </span>
    </Tooltip>
  )
}
