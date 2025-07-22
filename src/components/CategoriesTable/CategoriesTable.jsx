// src/components/CategoriesTable/CategoriesTable.jsx

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
import CategoriesActions from './CategoriesActions'

export default function CategoriesTable({
  data = [],
  loading,
  onEditCategory,
  onDeleteCategory,
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
            data.map((category) => (
              <TableRow key={category.id}>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {category.name}
                </TableCell>
                <TableCell align="right">
                  <CategoriesActions
                    category={category}
                    onEdit={onEditCategory}
                    onDelete={onDeleteCategory}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
