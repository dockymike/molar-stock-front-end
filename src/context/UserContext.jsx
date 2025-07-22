import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import api from '../services/api.jsx'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      // First check localStorage for quick initial state
      const storedUser = localStorage.getItem('user')
      const authStatus = localStorage.getItem('isAuthenticated')

      // If localStorage explicitly says not authenticated, skip API call
      if (authStatus === 'false') {
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // Set initial state from localStorage if available and stop loading immediately
      if (storedUser && authStatus === 'true') {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
        setIsLoading(false) // Stop loading immediately with cached data
      }

      try {
        // Verify with server using httpOnly cookie (unless explicitly logged out)
        const response = await api.get('/me')
        const { user: serverUser } = response.data

        // Update state with fresh server data (but don't show loading again)
        setUser(serverUser)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(serverUser))
        localStorage.setItem('isAuthenticated', 'true')

      } catch (error) {
        // Cookie invalid or expired, clear local state
        setUser(null)
        setIsAuthenticated(false)
        localStorage.setItem('isAuthenticated', 'false')
        localStorage.removeItem('user')
      } finally {
        // Only set loading false if we haven't already (for cases without localStorage)
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = useCallback((userData) => {
    // Clear any existing user data and cache before setting new user
    localStorage.removeItem('user') // This triggers cache clear in api.jsx
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isAuthenticated', 'true')
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await api.post('/users/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    }

    // Explicitly set localStorage to prevent future API calls
    localStorage.setItem('isAuthenticated', 'false')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }, [])
  
  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => {
      if (!prevUser) return null
      const newUser = { ...prevUser, ...updatedUserData }
      localStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    })
  }, [])

  // Helper function to check if user is authenticated without API call
  const checkLocalAuth = useCallback(() => {
    const authStatus = localStorage.getItem('isAuthenticated')
    return authStatus === 'true'
  }, [])

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkLocalAuth
  }), [user, isAuthenticated, isLoading, login, logout, updateUser, checkLocalAuth])

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
