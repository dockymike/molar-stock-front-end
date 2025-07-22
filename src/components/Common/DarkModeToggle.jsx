// src/components/Common/DarkModeToggle.jsx
import { IconButton, useTheme } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useContext } from 'react'
import ColorModeContext from '../../theme/ColorModeContext'

export default function DarkModeToggle() {
  const theme = useTheme()
  const colorMode = useContext(ColorModeContext)

  return (
    <IconButton onClick={colorMode.toggleColorMode} color="inherit">
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  )
}
