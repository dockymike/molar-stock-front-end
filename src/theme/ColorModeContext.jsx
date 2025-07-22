// ✅ src/theme/ColorModeContext.jsx
import { createContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useUser } from '../context/UserContext'
import { updateDarkModePreference } from '../services/UserService'

const ColorModeContext = createContext({
  toggleColorMode: () => {},
})

export function ColorModeProvider({ children }) {
  const { user } = useUser()
  const [mode, setMode] = useState('light')

  // ✅ Set theme mode based on user preference
  useEffect(() => {
    if (user?.dark_mode !== undefined) {
      setMode(user.dark_mode ? 'dark' : 'light')
    }
  }, [user])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light'
          if (user?.id) {
            updateDarkModePreference(user.id, newMode === 'dark')
          }
          return newMode
        })
      },
    }),
    [user]
  )

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export default ColorModeContext
