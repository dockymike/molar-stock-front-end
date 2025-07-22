// src/services/api.js
import axios from 'axios'

// Simple in-memory cache for GET requests
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Include cookies in requests
})

// Cache for GET requests
api.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is set
    config.withCredentials = true
    
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`
      const cached = cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        // Return cached response as a resolved promise
        config._cached = cached.data
      }
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Function to clear cache entries by URL pattern
const clearCacheByPattern = (pattern) => {
  for (const [key] of cache.entries()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

// ✅ Auto-logout on 401 Unauthorized and handle caching
api.interceptors.response.use(
  (response) => {
    // Check if this was a cached response
    if (response.config._cached) {
      return Promise.resolve(response.config._cached)
    }

    // Clear relevant cache on data-modifying operations
    if (['post', 'put', 'delete', 'patch'].includes(response.config.method)) {
      const url = response.config.url || ''
      
      // Clear inventory cache when inventory is modified
      if (url.includes('/inventory')) {
        clearCacheByPattern('/inventory')
        // Also clear low stock alerts cache when inventory changes
        clearCacheByPattern('/low-stock')
      }
      // Clear categories cache when categories are modified
      if (url.includes('/categories')) {
        clearCacheByPattern('/categories')
      }
      // Clear suppliers cache when suppliers are modified
      if (url.includes('/suppliers')) {
        clearCacheByPattern('/suppliers')
      }
      // Clear locations cache when locations are modified
      if (url.includes('/locations')) {
        clearCacheByPattern('/locations')
      }
    }

    // Cache GET responses
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })
    }

    return response
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      // Don't redirect on network errors
      return Promise.reject({
        response: {
          data: {
            error: 'Network error. Please check your connection.'
          }
        }
      })
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear cache on authentication error
      cache.clear()

      // Set localStorage to prevent future API calls
      localStorage.setItem('isAuthenticated', 'false')
      localStorage.removeItem('user')

      // Only redirect if we're not already on login/register pages
      const currentPath = window.location.pathname
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Clear cache when user logs out
const originalRemoveItem = localStorage.removeItem.bind(localStorage)
localStorage.removeItem = function(key) {
  if (key === 'user' || key === 'isAuthenticated') {
    cache.clear()
  }
  return originalRemoveItem(key)
}

export default api
