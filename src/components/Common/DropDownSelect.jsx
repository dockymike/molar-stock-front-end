// src/components/Common/DropDownSelect.jsx
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { useRef } from 'react'

export default function DropDownSelect({
  label = 'Select Option',
  value,
  onChange,
  options = [],
  fullWidth = true,
  sx = {},
  blurOnChange = false,
  inputRef, // ✅ Correct name for clarity and consistency
}) {
  const internalRef = useRef(null)
  const refToUse = inputRef || internalRef

  return (
    <FormControl fullWidth={fullWidth} sx={sx}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => {
          onChange(e.target.value)
          if (blurOnChange && refToUse.current) {
            setTimeout(() => {
              refToUse.current.blur()
            }, 100)
          }
        }}
        inputRef={refToUse} // ✅ Correct ref assignment
      >
        {options.map((option) => (
          <MenuItem key={option.id || option} value={option.id || option}>
            {option.name || option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
