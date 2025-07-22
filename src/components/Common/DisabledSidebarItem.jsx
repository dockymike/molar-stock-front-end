// src/components/Common/DisabledSidebarItem.jsx
import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material'

export default function DisabledSidebarItem({ icon, label, reason }) {
  return (
    <Tooltip
      title={reason}
      placement="right"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: '0.9rem', // ← make this bigger if needed
            maxWidth: 240,
            bgcolor: '#424242',
            color: 'white',
            p: 1,
            fontWeight: 500,
          },
        },
      }}
    >
      <span>
        <ListItem
          disabled
          sx={{
            opacity: 0.5,
            pointerEvents: 'none',
            '&:hover': {
              opacity: 0.5,
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
          <ListItemText primary={label} />
        </ListItem>
      </span>
    </Tooltip>
  )
}
