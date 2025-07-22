// src/components/Common/RadioButtonGroup.jsx
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material'

export default function RadioButtonGroup({ label, options, value, onChange }) {
  return (
    <FormControl component="fieldset" sx={{ mb: 2 }}>
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
        row
      >
        {options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio />}
            label={opt.label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}
