// ✅ src/context/LowStockContext.jsx — fixed forced refresh + clean logs
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import { fetchLowStockAlerts } from '../services/LowStockThresholdService'
import { useUser } from './UserContext'

const LowStockContext = createContext()

export function LowStockProvider({ children }) {
  const [lowStockAlerts, setLowStockAlerts] = useState([])
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const intervalRef = useRef(null)
  const { user, isAuthenticated } = useUser()

  // ✅ Always trust backend and update — force state update
  const refreshLowStockAlerts = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 Skipping low stock fetch - user not authenticated')
      setLowStockAlerts([])
      return
    }

    try {
      console.log('🌀 Fetching low stock alerts for user:', user.id)
      const alerts = await fetchLowStockAlerts()
      console.log('📥 Response from API:', alerts)

      // ✅ Force React to recognize state change by always setting new array
      setLowStockAlerts([...alerts])

      console.log('✅ Low stock alerts updated in context.')
    } catch (error) {
      if (error?.response?.status === 401) {
        console.warn('⚠️ Unauthorized — likely not logged in')
        setLowStockAlerts([])
      } else {
        console.error('❌ Failed to fetch low stock alerts:', error)
      }
    }
  }, [isAuthenticated, user])

  // 📺 Pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)
      console.log(`👁 Tab is now ${visible ? 'VISIBLE' : 'HIDDEN'}`)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 🔄 Clear alerts when user changes and fetch new ones
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLowStockAlerts([])
      clearInterval(intervalRef.current)
      return
    }

    console.log('🚀 User changed, fetching low stock alerts for user:', user.id)
    setLowStockAlerts([]) // Clear old alerts immediately
    refreshLowStockAlerts()
  }, [user?.id, isAuthenticated, refreshLowStockAlerts])

  // ⏱ Start polling when visible
  useEffect(() => {
    if (!isAuthenticated || !user) return

    if (isVisible) {
      intervalRef.current = setInterval(() => {
        console.log('🔁 Polling low stock alerts...')
        refreshLowStockAlerts()
      }, 60000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [refreshLowStockAlerts, isVisible, isAuthenticated, user])

  const contextValue = useMemo(() => ({
    lowStockAlerts,
    triggerLowStockRefresh: refreshLowStockAlerts,
  }), [lowStockAlerts, refreshLowStockAlerts])

  return (
    <LowStockContext.Provider value={contextValue}>
      {children}
    </LowStockContext.Provider>
  )
}

export function useLowStock() {
  return useContext(LowStockContext)
}
