// 📁 src/services/StripeService.js
import api from './api.jsx'

// ✅ Create a Stripe Checkout Session for subscription
export async function createStripeCheckoutSession(priceId, userId) {
  try {
    const res = await api.post(
      `/stripe/create-checkout-session`,
      { priceId, userId }
    )
    return res.data?.url
  } catch (err) {
    return null
  }
}

// ✅ Create a Stripe Billing Portal Session for managing subscriptions
export async function createPortalSession() {
  try {
    const res = await api.post(`/stripe/create-portal-session`, {})
    return res.data?.url
  } catch (err) {
    return null
  }
}
