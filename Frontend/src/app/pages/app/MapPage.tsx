import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { getSocket } from '../../lib/socket'

type LiveTruck = {
  id: string
  vehicleCode: string
  driverName: string
  lat: number
  lng: number
  speedKph: number
  lastPingAt: string
  activeSeconds: number
}

export const MapPage = () => {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['locations', 'TRUCK'],
    queryFn: async () => (await api.get('/locations/live?type=TRUCK')).data as LiveTruck[],
    refetchInterval: 10000,
  })
  const [positions, setPositions] = useState<Record<string, LiveTruck>>({})

  useEffect(() => {
    if (data) {
      const map: Record<string, LiveTruck> = {}
      for (const t of data) map[t.id] = t
      setPositions(map)
    }
  }, [data])

  useEffect(() => {
    const s = getSocket()
    const handler = (payload: LiveTruck) => {
      setPositions((prev) => ({ ...prev, [payload.id]: payload }))
    }
    s.on('location:update', handler)
    return () => {
      s.off('location:update', handler)
    }
  }, [])

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
        <div className="text-sm text-gray-600">
          Active in last{' '}
          {Math.max(
            0,
            ...Object.values(positions).map((p) => p.activeSeconds ?? 0)
          )}{' '}
          seconds
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '70vh', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.values(positions).map((t) => (
            <Marker key={t.id} position={[t.lat, t.lng]}>
              <Tooltip>
                <div className="text-sm">
                  <div className="font-medium">{t.vehicleCode}</div>
                  <div>{t.driverName}</div>
                  <div>Speed: {Math.round(t.speedKph)} kph</div>
                  <div>Last ping: {new Date(t.lastPingAt).toLocaleString()}</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
