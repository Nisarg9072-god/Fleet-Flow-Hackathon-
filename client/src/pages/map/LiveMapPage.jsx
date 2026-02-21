import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import axios from 'axios'
import { io } from 'socket.io-client'

export default function LiveMapPage() {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const ws = import.meta.env.VITE_WS_URL || 'http://localhost:5000'
  const [token, setToken] = useState('')
  const [type, setType] = useState('TRUCK')
  const [points, setPoints] = useState([])
  const center = useMemo(() => [23.0225, 72.5714], [])

  useEffect(() => {
    if (!token) return
    const fetchLive = async () => {
      try {
        const res = await axios.get(`${api}/locations/live`, {
          params: { type },
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = res.data.locations || res.data.live || []
        const mapped = data.map((x) => ({
          vehicleId: x.vehicleId,
          vehicleCode: x.vehicle?.vehicleCode || x.vehicleCode,
          vehicleType: x.vehicle?.type || x.vehicleType,
          lat: x.lat,
          lng: x.lng,
          lastPingAt: x.timestamp || x.lastPingAt
        }))
        setPoints(mapped)
      } catch {
      }
    }
    fetchLive()
  }, [api, token, type])

  useEffect(() => {
    if (!token) return
    const s = io(ws, { transports: ['websocket'] })
    s.on('location:update', (p) => {
      setPoints((prev) => {
        const idx = prev.findIndex((v) => v.vehicleId === p.vehicleId)
        const next = { vehicleId: p.vehicleId, vehicleCode: p.vehicleCode || p.vehicleId, vehicleType: type, lat: p.lat, lng: p.lng, lastPingAt: p.timestamp || p.lastPingAt }
        if (idx >= 0) {
          const copy = prev.slice()
          copy[idx] = next
          return copy
        }
        return [next, ...prev]
      })
    })
    return () => s.close()
  }, [ws, token, type])

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div style={{ padding: 12, display: 'flex', gap: 8 }}>
        <input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="TRUCK">TRUCK</option>
          <option value="VAN">VAN</option>
          <option value="BIKE">BIKE</option>
        </select>
      </div>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <CircleMarker key={p.vehicleId} center={[p.lat, p.lng]} radius={8} pathOptions={{ color: 'blue' }}>
            <Popup>
              <div>
                <div>{p.vehicleCode || p.vehicleId}</div>
                <div>{p.vehicleType}</div>
                <div>{String(p.lastPingAt)}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
