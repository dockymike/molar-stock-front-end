// Debug component to test location fetching
import { useState, useEffect } from 'react'
import { Button, Typography, Box, Paper } from '@mui/material'
import { fetchLocations } from '../../services/LocationService'
import DropDownSelect from '../Common/DropDownSelect'

export default function LocationTest() {
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testFetchLocations = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🧪 Testing location fetch...')
      const locs = await fetchLocations()
      console.log('🧪 Locations received:', locs)
      setLocations(locs)
    } catch (err) {
      console.error('🧪 Location fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testFetchLocations()
  }, [])

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        🧪 Location Dropdown Test
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testFetchLocations}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh Locations'}
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      <Typography variant="body2" sx={{ mb: 2 }}>
        Locations found: {locations.length}
      </Typography>

      {locations.length > 0 && (
        <>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Raw locations data:
          </Typography>
          <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', marginBottom: '16px' }}>
            {JSON.stringify(locations, null, 2)}
          </pre>

          <DropDownSelect
            label="Test Location Dropdown"
            value={selectedLocation}
            onChange={setSelectedLocation}
            options={locations.map((loc) => ({ id: loc.id, name: loc.name }))}
          />

          {selectedLocation && (
            <Typography sx={{ mt: 2 }}>
              Selected: {selectedLocation} ({typeof selectedLocation})
            </Typography>
          )}
        </>
      )}
    </Paper>
  )
}
