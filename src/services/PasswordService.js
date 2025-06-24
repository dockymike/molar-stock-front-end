import axios from 'axios'
const API = import.meta.env.VITE_API_URL

export async function requestPasswordReset(email) {
  console.log('🚀 [requestPasswordReset] Initiating password reset...')
  console.log('📧 Email input:', email)
  console.log('🔗 Target API endpoint:', `${API}/password/request-reset`)

  const payload = { email }
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000, // optional timeout for safety
  }

  console.log('📦 Request Payload:', payload)
  console.log('🛡️ Request Headers:', config.headers)
  console.time('⏱️ Request duration')

  try {
    const res = await axios.post(`${API}/password/request-reset`, payload, config)

    console.timeEnd('⏱️ Request duration')
    console.log('✅ [requestPasswordReset] Success')
    console.log('🔢 Response status:', res.status)
    console.log('📨 Response headers:', res.headers)
    console.log('📬 Response body:', res.data)

    return res.data
  } catch (err) {
    console.timeEnd('⏱️ Request duration')
    console.error('❌ [requestPasswordReset] ERROR')

    if (err.response) {
      console.error('🧾 Server responded with an error:')
      console.error('🔢 Status:', err.response.status)
      console.error('📄 Data:', err.response.data)
      console.error('📨 Headers:', err.response.headers)
    } else if (err.request) {
      console.error('📭 Request made but no response received')
      console.error('📡 Axios request object:', err.request)
    } else {
      console.error('⚠️ Something went wrong setting up the request')
      console.error('🧠 Message:', err.message)
    }

    console.error('🪵 Full error object:', err)
    throw err
  }
}
