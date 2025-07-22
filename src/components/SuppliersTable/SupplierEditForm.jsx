// src/components/Forms/SupplierEditForm.jsx
// src/components/SuppliersTable/SupplierEditForm.jsx
import { Grid, TextField } from '@mui/material'

export default function SupplierEditForm({ formData, onChange }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          label="Supplier Name"
          name="name"
          value={formData.name || ''}
          onChange={onChange}
          fullWidth
          required
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Point of Contact"
          name="poc"
          value={formData.poc || ''}
          onChange={onChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Email"
          name="email"
          value={formData.email || ''}
          onChange={onChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Phone"
          name="phone"
          value={formData.phone || ''}
          onChange={onChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Website Link"
          name="web_link"
          value={formData.web_link || ''}
          onChange={onChange}
          fullWidth
        />
      </Grid>
    </Grid>
  )
}
