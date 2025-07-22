// src/components/Topbar/LowStockModal.jsx (Grouped by Supplier with Accordions)
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Stack,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export default function LowStockModal({ open, onClose, alerts = [] }) {
  // Group alerts by supplier name
  const grouped = alerts.reduce((acc, alert) => {
    const supplierName = alert.supplier?.name || 'Unknown Supplier'
    if (!acc[supplierName]) acc[supplierName] = []
    acc[supplierName].push(alert)
    return acc
  }, {})

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Low Stock Alerts
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {alerts.length === 0 ? (
          <Typography>No low stock items 🎉</Typography>
        ) : (
          Object.entries(grouped).map(([supplierName, items], index) => {
            const first = items[0].supplier || {}
            return (
              <Accordion key={supplierName || index} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {supplierName}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  {/* Supplier Info */}
                  <Stack spacing={0.5} mb={2}>
                    {first.poc && (
                      <Typography variant="body2">
                        <strong>POC:</strong> {first.poc}
                      </Typography>
                    )}
                    {first.email && (
                      <Typography variant="body2">
                        <strong>Email:</strong>{' '}
                        <Link href={`mailto:${first.email}`} underline="hover">
                          {first.email}
                        </Link>
                      </Typography>
                    )}
                    {first.phone && (
                      <Typography variant="body2">
                        <strong>Phone:</strong>{' '}
                        <Link href={`tel:${first.phone}`} underline="hover">
                          {first.phone}
                        </Link>
                      </Typography>
                    )}
                    {first.website && (
                      <Typography variant="body2">
                        <strong>Website:</strong>{' '}
                        <Link
                          href={first.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                        >
                          {first.website}
                        </Link>
                      </Typography>
                    )}
                  </Stack>

                  {/* Inventory Items */}
                  <List>
                    {items.map((alert) => (
                      <ListItem
                        key={`${alert.inventory_id}-${alert.location_id}`}
                        sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Typography fontWeight="bold">
                              {alert.name} — {alert.remaining} {alert.unit}
                            </Typography>
                          }
                          secondary={`Location: ${alert.location_name}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          })
        )}
      </DialogContent>
    </Dialog>
  )
}
