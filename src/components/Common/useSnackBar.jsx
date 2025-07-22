// src/components/Common/useSnackBar.jsx
import { useSnackbar } from 'notistack'

export default function useCustomSnackbar() {
  const { enqueueSnackbar } = useSnackbar()

  const showSuccess = (message) => {
    enqueueSnackbar(message, { variant: 'success' })
  }

  const showError = (message) => {
    enqueueSnackbar(message, { variant: 'error' })
  }

  const showInfo = (message) => {
    enqueueSnackbar(message, { variant: 'info' })
  }

  const showWarning = (message) => {
    enqueueSnackbar(message, { variant: 'warning' })
  }

  return { showSuccess, showError, showInfo, showWarning }
}
