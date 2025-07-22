// src/theme/theme.js
import { createTheme } from '@mui/material/styles'

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#F57C00', // orange[700]
          },
          secondary: {
            main: '#1976d2',
          },
          background: {
            default: '#f4f6f8',
            paper: '#ffffff',
          },
          sidebarHighlight: '#FFF3E0', // orange[50]
        }
      : {
          primary: {
            main: '#90CAF9', // blue[300]
          },
          secondary: {
            main: '#1976d2',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          sidebarHighlight: '#2A2A2A', // deep neutral
        }),
  },
  typography: {
    fontFamily: ['"Inter"', 'sans-serif'].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
})

const getAppTheme = (mode) => createTheme(getDesignTokens(mode));
export default getAppTheme;
