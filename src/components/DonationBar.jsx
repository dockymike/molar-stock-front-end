import { useState, useEffect } from 'react'
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
import {
  createStripeCheckoutSession,
  createPortalSession,
} from '../services/StripeService'

const priceMap = {
  6: 'price_1RdNThJWeUW9m1dQSDvz7CvF',
  12: 'price_1RdNTvJWeUW9m1dQFGYOXcsl',
  29: 'price_1RdNUBJWeUW9m1dQ9ZswOwKN',
  59: 'price_1RdNUSJWeUW9m1dQJl1AMmq1',
  99: 'price_1RdNUkJWeUW9m1dQxKakgKKq',
}

const mappedValues = [6, 12, 29, 59, 99]
const sliderSteps = [0, 25, 50, 75, 100]

export default function DonationBar() {
  const [sliderValue, setSliderValue] = useState(50)
  const [isPaidUser, setIsPaidUser] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    const checkUser = () => {
      const user = JSON.parse(localStorage.getItem('user'))
      const isPaid = user?.is_paid === true
      setIsPaidUser(isPaid)
      console.log('🔁 DonationBar - User is_paid:', isPaid)
    }

    checkUser()
    const interval = setInterval(checkUser, 1000) // watch for localStorage changes

    return () => clearInterval(interval)
  }, [])

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

  const handleManageSubscription = async () => {
    try {
      const url = await createPortalSession()
      if (url) {
        window.location.href = url
      } else {
        alert('Could not load Stripe portal. Please try again.')
      }
    } catch (err) {
      console.error('Portal Error:', err)
      alert('Could not load Stripe portal. Please try again.')
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
        {isPaidUser ? (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography variant="body2" fontWeight={500}>
              🎉 Thank you for supporting us!
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleManageSubscription}
            >
              Manage Subscription
            </Button>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={4}
            flexWrap="wrap"
          >
            <Box flex={1} minWidth={260}>
              <Typography variant="body2" fontWeight={500}>
                Yes, it's free. However, continued development and support of this product gets really expensive...
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
        )}
      </Container>
    </Paper>
  )
}
