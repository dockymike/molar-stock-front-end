import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function createStripeCheckoutSession(priceId, userId) {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.post(
      `${API}/stripe/create-checkout-session`,
      { priceId, userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return res.data?.url
  } catch (err) {
    console.error('❌ Stripe Checkout Error:', err)
    return null
  }
}
