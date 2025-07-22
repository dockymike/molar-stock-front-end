import React from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { ErrorOutline } from '@mui/icons-material'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            m: 2, 
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto',
            mt: 8
          }}
        >
          <ErrorOutline 
            sx={{ 
              fontSize: 64, 
              color: 'error.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </Typography>
          
          {import.meta.env.DEV && this.state.error && (
            <Box sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" color="error" sx={{ fontFamily: 'monospace', mb: 1 }}>
                {this.state.error.toString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {this.state.errorInfo.componentStack}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
            <Button 
              variant="outlined" 
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Box>
        </Paper>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary