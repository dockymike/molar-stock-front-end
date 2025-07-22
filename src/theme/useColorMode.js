import { useContext } from 'react'
import ColorModeContext from './ColorModeContext'

export const useColorMode = () => {
  const context = useContext(ColorModeContext)
  if (!context) throw new Error('ColorModeContext not found')
  return context
}
