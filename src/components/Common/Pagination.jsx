// src/components/Common/Pagination.jsx
import { TablePagination } from '@mui/material'

export default function Pagination({ page, rowsPerPage, count, onChangePage, onChangeRowsPerPage }) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={(_, newPage) => onChangePage(newPage)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt(e.target.value, 10))}
      rowsPerPageOptions={[5, 10, 25]}
    />
  )
}
