import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { toast } from 'sonner'
import { getSocket } from '../../lib/socket'
import { useNavigate } from 'react-router'

export const TrackerPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: trips } = useQuery({
    queryKey: ['trips', 'DISPATCHED'],
    queryFn: async () => {
      const res = await api.get('/trips?status=DISPATCHED')
      return res.data?.trips ?? []
    },
  })
  const [vehicleId, setVehicleId] = useState<string>('')
  const [driverId, setDriverId] = useState<string>('')
  const [watchId, setWatchId] = useState<number | null>(null)
  const lastSentRef = useRef<number | null>(null)
  const [lastText, setLastText] = useState<string>('Idle')
  const timerRef = useRef<number | null>(null)
  const latestPosRef = useRef<GeolocationPosition | null>(null)

  const start = () => {
    if (!vehicleId || !driverId) {
      toast.error('Select a driver first')
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
          driverId,
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
    const s = getSocket()
    const refetch = () => queryClient.invalidateQueries({ queryKey: ['trips', 'DISPATCHED'] })
    s.on('trip:dispatched', refetch)
    s.on('trip:completed', refetch)
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      if (timerRef.current) window.clearInterval(timerRef.current)
      s.off('trip:dispatched', refetch)
      s.off('trip:completed', refetch)
    }
  }, [watchId, queryClient])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tracker</h1>
        <button
          onClick={() => navigate('/app/map')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Go to Live Map
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver (Dispatched)</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={driverId}
              onChange={(e) => {
                const did = e.target.value
                setDriverId(did)
                const trip = (trips ?? []).find((t: any) => t.driverId === did)
                setVehicleId(trip?.vehicleId ?? '')
              }}
            >
              <option value="">Choose a driver</option>
              {(trips ?? []).map((t: any) => (
                <option key={t.id} value={t.driverId}>
                  {t.driver?.fullName ?? t.driverId} — {t.vehicle?.vehicleCode ?? t.vehicleId} ({t.origin} → {t.destination})
                </option>
              ))}
            </select>
          </div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Live Deliveries</h2>
            <p className="text-sm text-gray-600">Current dispatched trips</p>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Vehicle</th>
                <th className="px-4 py-2">Origin</th>
                <th className="px-4 py-2">Destination</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">Map</th>
              </tr>
            </thead>
            <tbody>
              {(trips ?? []).map((t: any) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2">{t.driver?.fullName ?? t.driverId}</td>
                  <td className="px-4 py-2">{t.vehicle?.vehicleCode ?? t.vehicleId}</td>
                  <td className="px-4 py-2">{t.origin}</td>
                  <td className="px-4 py-2">{t.destination}</td>
                  <td className="px-4 py-2">{t.startTime ? new Date(t.startTime).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/app/map?vehicleId=${encodeURIComponent(t.vehicleId)}&driverId=${encodeURIComponent(
                            t.driverId
                          )}&showRoutes=1`
                        )
                      }
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      Live Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
