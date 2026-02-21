import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import { toast } from 'sonner'

export const TrackerPage = () => {
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', 'ALL'],
    queryFn: async () => (await api.get('/vehicles')).data,
  })
  const [vehicleId, setVehicleId] = useState<string>('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const lastSentRef = useRef<number | null>(null)
  const [lastText, setLastText] = useState<string>('Idle')
  const timerRef = useRef<number | null>(null)
  const latestPosRef = useRef<GeolocationPosition | null>(null)

  const start = () => {
    if (!vehicleId) {
      toast.error('Select a vehicle first')
      return
    }
    if (!('geolocation' in navigator)) {
      toast.error('GPS not available in this browser')
      return
    }
    const wid = navigator.geolocation.watchPosition(
      (pos) => {
        latestPosRef.current = pos
        setLastText(`GPS ok: ${new Date(pos.timestamp).toLocaleTimeString()}`)
      },
      (err) => {
        toast.error(`GPS error: ${err.message}`)
      },
      { enableHighAccuracy: true }
    )
    setWatchId(wid)
    const t = window.setInterval(async () => {
      const pos = latestPosRef.current
      if (!pos) return
      const { latitude: lat, longitude: lng } = pos.coords
      try {
        await api.post('/locations/ping', {
          vehicleId,
          lat,
          lng,
        })
        lastSentRef.current = Date.now()
        setLastText(`Last sent: ${new Date(lastSentRef.current).toLocaleTimeString()}`)
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Ping failed')
      }
    }, 4000)
    timerRef.current = t
    toast.success('Tracking started')
  }

  const stop = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    if (timerRef.current) window.clearInterval(timerRef.current)
    setWatchId(null)
    timerRef.current = null
    toast.success('Tracking stopped')
  }

  useEffect(() => {
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [watchId])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Tracker</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-xl">
        <div className="space-y-4">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          >
            <option value="">Select a vehicle</option>
            {(vehicles ?? []).map((v: any) => (
              <option key={v.id} value={v.id}>
                {v.code}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={start}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Start Tracking
            </button>
            <button
              onClick={stop}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Stop Tracking
            </button>
          </div>
          <div className="text-sm text-gray-600">Status: {lastText}</div>
        </div>
      </div>
    </div>
  )
}
