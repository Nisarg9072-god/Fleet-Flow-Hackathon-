import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetops_token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// Gracefully swallow canceled/aborted requests during HMR/navigation
api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Axios cancel or browser abort mapped to canceled
    // @ts-ignore
    const isCanceled =
      axios.isCancel?.(error) ||
      error?.code === 'ERR_CANCELED' ||
      error?.name === 'CanceledError' ||
      error?.message?.toString?.().toLowerCase?.().includes('canceled') ||
      error?.message?.toString?.().toLowerCase?.().includes('abort')
    if (isCanceled) {
      return Promise.resolve({ data: { canceled: true } } as any)
    }
    return Promise.reject(error)
  }
)

export default api
