import React, { useMemo, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider } from '@mui/material'
import ColorModeContext from './theme/ColorModeContext'
import { BrowserRouter } from 'react-router-dom'
import getAppTheme from './theme/theme'
import { UserProvider } from './context/UserContext'
import { SnackbarProvider } from 'notistack'
import { LowStockProvider } from './context/LowStockContext'
import { updateDarkModePreference } from './services/UserService'

const Main = () => {
  const [mode, setMode] = useState('light')

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (storedUser?.dark_mode !== undefined) {
      setMode(storedUser.dark_mode ? 'dark' : 'light')
    }
  }, [])

  const colorMode = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === 'light' ? 'dark' : 'light'
        const storedUser = JSON.parse(localStorage.getItem('user'))
        if (storedUser?.id) {
          updateDarkModePreference(storedUser.id, newMode === 'dark').catch(console.error)
        }
        return newMode
      })
    },
    setMode,
    mode,
  }), [mode])

  const theme = useMemo(() => getAppTheme(mode), [mode])

  const currentUserId = JSON.parse(localStorage.getItem('user'))?.id || 'guest'

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <UserProvider>
            <LowStockProvider>
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                {/* This remounts App when user changes */}
                <App key={currentUserId} />
              </SnackbarProvider>
            </LowStockProvider>
          </UserProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
