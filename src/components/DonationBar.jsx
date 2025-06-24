// 📁 src/components/DonationBar.jsx
import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Slider,
  Paper,
  useTheme,
  Container,
  Tooltip,
} from '@mui/material'
import { createStripeCheckoutSession } from '../services/StripeService' // ✅ Import service

// ✅ Stripe Price IDs
const priceMap = {
  6: 'price_1RdKrMQr2Jpjfm63VOQJdMvy',
  12: 'price_1RdKrkQr2Jpjfm63tNzVXSTZ',
  29: 'price_1RdKs0Qr2Jpjfm63hH2UDB5v',
  59: 'price_1RdKt3Qr2Jpjfm63vz9dwImw',
  99: 'price_1RdKtIQr2Jpjfm63NfFJOGig',
}

const mappedValues = [6, 12, 29, 59, 99]
const sliderSteps = [0, 25, 50, 75, 100]

export default function DonationBar() {
  const [sliderValue, setSliderValue] = useState(50) // maps to $29 (default)
  const theme = useTheme()

  const handleSliderChange = (_, newSliderValue) => {
    setSliderValue(newSliderValue)
  }

  const getAmountFromSlider = (val) => {
    const index = sliderSteps.indexOf(val)
    return mappedValues[index] || 29
  }

  const donationAmount = getAmountFromSlider(sliderValue)

  const handleSubscribe = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const priceId = priceMap[donationAmount]

    if (!priceId || !user?.id) return

    try {
      const url = await createStripeCheckoutSession(priceId, user.id)
      if (url) {
        window.location.href = url
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (err) {
      console.error('Stripe Checkout Error:', err)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        bgcolor: '#fffbe6',
        borderBottom: '1px solid #ffe58f',
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap={4}
          flexWrap="wrap"
        >
          {/* LEFT COLUMN */}
          <Box flex={1} minWidth={260}>
            <Typography variant="body2" fontWeight={500}>
              Yes, it's free. However, continued development and support of this product gets really expensive. We want to add so many more features to help you. Help us continue to support you by considering a donation subscription of your choice. What's it worth to you?
            </Typography>

            <Box mt={1}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2">- Automated invoice requests from your suppliers</Typography>
                    <Typography variant="body2">- Order quantity recommendations based on supply usage</Typography>
                    <Typography variant="body2">- Discounted rates from suppliers</Typography>
                    <Typography variant="body2">- Intuitive dashboard for inventory analytics</Typography>
                  </Box>
                }
                arrow
              >
                <Typography
                  variant="caption"
                  sx={{ textDecoration: 'underline', color: 'primary.main', cursor: 'pointer' }}
                >
                  Future Features
                </Typography>
              </Tooltip>
            </Box>

            <Slider
              value={sliderValue}
              onChange={handleSliderChange}
              step={null}
              marks={sliderSteps.map((step, i) => ({
                value: step,
                label: `$${mappedValues[i]}`,
              }))}
              min={0}
              max={100}
              sx={{
                mt: 2,
                width: '100%',
                '& .MuiSlider-markLabel': {
                  fontSize: '0.75rem',
                  color: theme.palette.text.secondary,
                },
              }}
            />
          </Box>

          {/* RIGHT COLUMN */}
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            justifyContent="center"
            gap={1}
            minWidth={120}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              ${donationAmount}/month
            </Typography>
            <Button variant="contained" size="small" onClick={handleSubscribe}>
              Subscribe
            </Button>
          </Box>
        </Box>
      </Container>
    </Paper>
  )
}
