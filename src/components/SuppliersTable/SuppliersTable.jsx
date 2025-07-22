// src/components/SuppliersTable/SuppliersTable.jsx
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material'
import SupplierActions from './SupplierActions'

export default function SuppliersTable({
  data = [],
  loading,
  onEditSupplier,
  onDeleteSupplier,
}) {
  const theme = useTheme()

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 5 }}>
        <CircularProgress />
      </Typography>
    )
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        boxShadow: 'none',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Table sx={{ width: '100%' }}>
        <TableHead
          sx={{
            backgroundColor:
              theme.palette.mode === 'dark' ? '#1f1f1f' : '#f5f5f5',
          }}
        >
          <TableRow>
            {['Name', 'Actions'].map((label, i) => (
              <TableCell
                key={i}
                align={label === 'Actions' ? 'right' : 'left'}
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 'bold',
                }}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {supplier.name}
                </TableCell>
                <TableCell align="right">
                  <SupplierActions
                    supplier={supplier}
                    onEdit={onEditSupplier}
                    onDelete={onDeleteSupplier}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                No suppliers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
