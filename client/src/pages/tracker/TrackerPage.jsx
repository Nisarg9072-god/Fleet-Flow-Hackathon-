import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

export default function TrackerPage() {
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [token, setToken] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState('idle')
  const watchIdRef = useRef(null)
  const lastSentRef = useRef(0)
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }
    if (!vehicleId || !token) {
      setStatus('missing vehicleId/token')
      setEnabled(false)
      return
    }
    setStatus('requesting')
    const onSuccess = async (pos) => {
      const now = Date.now()
      if (now - lastSentRef.current < 3000) return
      lastSentRef.current = now
      const { latitude, longitude, speed, heading } = pos.coords
      try {
        await axios.post(
          `${api}/locations/ping`,
          {
            vehicleId,
            driverId: driverId || undefined,
            lat: latitude,
            lng: longitude,
            speedKph: speed != null ? speed * 3.6 : undefined,
            heading: heading != null ? heading : undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setStatus('ping ok')
      } catch (e) {
        setStatus('ping error')
      }
    }
    const onError = () => {
      setStatus('gps error')
    }
    const id = navigator.geolocation.watchPosition(onSuccess, onError, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 })
    watchIdRef.current = id
    setStatus('watching')
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [enabled, vehicleId, driverId, token, api])

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <h2>Driver Tracker</h2>
      <input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
      <input placeholder="Vehicle ID" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
      <input placeholder="Driver ID (optional)" value={driverId} onChange={(e) => setDriverId(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setEnabled(true)} disabled={enabled}>Start</button>
        <button onClick={() => setEnabled(false)} disabled={!enabled}>Stop</button>
      </div>
      <div>Status: {status}</div>
      <div>API: {api}</div>
    </div>
  )
}
