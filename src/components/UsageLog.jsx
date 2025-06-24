import { useEffect, useState } from 'react'
import { fetchLogs } from '../services/UsageLogService'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from '@mui/material'

export default function UsageLogs() {
  const [groupedLogs, setGroupedLogs] = useState([])

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!user?.id || !token) return

    fetchLogs(user.id, token)
      .then((data) => {
        const grouped = {}

        data.forEach((log) => {
          const key = `${log.procedure_name || 'Manual Entry'}|${log.op_name}|${new Date(log.created_at).toLocaleString()}`
          if (!grouped[key]) {
            grouped[key] = {
              procedure: log.procedure_name || 'Manual Entry',
              op: log.op_name,
              time: new Date(log.created_at).toLocaleString(),
              supplies: [],
            }
          }
          grouped[key].supplies.push({
            name: log.supply_name,
            quantity: log.quantity,
            unit_cost: log.unit_cost || 0,
            total_cost: log.total_cost || 0,
          })
        })

        setGroupedLogs(Object.values(grouped))
      })
      .catch((err) => console.error('❌ Failed to fetch usage logs', err))
  }, [user?.id, token])

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Usage Logs
      </Typography>

      {groupedLogs.length === 0 ? (
        <Typography variant="body1">No logs yet.</Typography>
      ) : (
        groupedLogs.map((group, idx) => (
          <Card key={idx} sx={{ my: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Procedure: {group.procedure}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Operatory: {group.op}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Date: {group.time}
              </Typography>

              <Divider sx={{ my: 1 }} />

              {/* Table Header */}
              <Box display="flex" fontWeight="bold" mb={1}>
                <Box flex={3}>Supply</Box>
                <Box flex={1}>Qty</Box>
                <Box flex={2}>Cost/Unit</Box>
                <Box flex={2}>Total</Box>
              </Box>

              {/* Table Rows */}
              {group.supplies.map((item, i) => (
                <Box key={i} display="flex" mb={0.5}>
                  <Box flex={3}>{item.name}</Box>
                  <Box flex={1}>{item.quantity}</Box>
                  <Box flex={2}>${Number(item.unit_cost).toFixed(2)}</Box>
                  <Box flex={2}>${Number(item.total_cost).toFixed(2)}</Box>
                </Box>
              ))}

              <Divider sx={{ my: 1 }} />

              {/* Grand Total */}
              <Box display="flex" justifyContent="flex-end">
                <Box fontWeight="bold">Grand Total:&nbsp;</Box>
                <Box fontWeight="bold">
                  ${group.supplies.reduce((sum, item) => sum + Number(item.total_cost), 0).toFixed(2)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  )
}
