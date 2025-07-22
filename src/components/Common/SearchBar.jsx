// src/components/Common/SearchBar.jsx
import { Box, InputBase, useTheme } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export default function SearchBar({ placeholder = 'Search...', onChange }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
        px: 2,
        py: 0.5,
        borderRadius: 2,
        width: '100%',
        maxWidth: 400,
      }}
    >
      <SearchIcon
        sx={{
          mr: 1,
          color: theme.palette.mode === 'dark' ? '#aaa' : '#888',
        }}
      />
      <InputBase
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        fullWidth
        sx={{
          color: theme.palette.text.primary,
        }}
      />
    </Box>
  )
}
