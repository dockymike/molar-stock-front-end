// 📁 src/components/LowStockThreshold.jsx
import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Link,
  IconButton,
  Collapse,
} from '@mui/material'
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import { fetchLowStockAlerts } from '../services/LowStockThresholdService'

export default function LowStockThreshold({ refreshKey }) {
  const [lowStockItems, setLowStockItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedContacts, setExpandedContacts] = useState({})

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user?.id) return

        const data = await fetchLowStockAlerts(user.id)

        if (!Array.isArray(data)) {
          setLowStockItems([])
          return
        }

        setLowStockItems(data)
      } catch (err) {
        console.error('❌ Failed to fetch low stock alerts:', err)
        setLowStockItems([])
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [refreshKey])

  const groupedBySupplier = lowStockItems.reduce((acc, item) => {
    const supplierId = item.supplier_id || 'unknown'
    if (!acc[supplierId]) acc[supplierId] = { supplier: item.supplier || {}, supplies: [] }
    acc[supplierId].supplies.push(item)
    return acc
  }, {})

  const toggleContactExpand = (supplierId) => {
    setExpandedContacts((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="center" mb={1}>
        <Typography variant="body2" color="textSecondary">
          🔔 Low Stock Alerts
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress size={20} />
      ) : lowStockItems.length === 0 ? (
        <Typography variant="body2" color="success.main">
          All supplies are above threshold ✅
        </Typography>
      ) : (
        Object.entries(groupedBySupplier).map(([supplierId, { supplier, supplies }]) => {
          const isExpanded = expandedContacts[supplierId] ?? false

          return (
            <Box key={supplierId} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={() => toggleContactExpand(supplierId)} size="small">
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
                <Typography variant="subtitle1" fontWeight="bold">
                  Supplier: {supplier.name || 'Unknown Supplier'}
                </Typography>
              </Box>

              {/* 🔼 Contact Info ABOVE supplies */}
              <Collapse in={isExpanded}>
                <Box ml={4} mt={1}>
                  {supplier.poc && (
                    <Typography variant="body2">POC: {supplier.poc}</Typography>
                  )}
                  {supplier.email && (
                    <Typography variant="body2">Email: {supplier.email}</Typography>
                  )}
                  {supplier.phone && (
                    <Typography variant="body2">Phone: {supplier.phone}</Typography>
                  )}
                  {supplier.website && (
                    <Typography variant="body2">
                      Website:{' '}
                      <Link
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {supplier.website}
                      </Link>
                    </Typography>
                  )}
                </Box>
              </Collapse>

              {/* 🧾 Supply List */}
              <List dense>
                {supplies.map((item, idx) => (
                  <ListItem key={`${item.type}-${item.id}-${idx}`} disablePadding>
                    <ListItemText
                      primary={`${item.name} (${item.remaining} ${item.unit}(s) remaining)`}
                      secondary={
                        item.type === 'global'
                          ? 'Global Supply'
                          : `Operatory: ${item.op_name}`
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />
            </Box>
          )
        })
      )}
    </Box>
  )
}
