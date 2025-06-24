// 📁 src/services/StripeService.js
import axios from 'axios'
const API = import.meta.env.VITE_API_URL

// ✅ Create a Stripe Checkout Session for subscription
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

// ✅ Create a Stripe Billing Portal Session for managing subscriptions
export async function createPortalSession() {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.post(
      `${API}/stripe/create-portal-session`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    return res.data?.url
  } catch (err) {
    console.error('❌ Stripe Portal Session Error:', err)
    return null
  }
}
