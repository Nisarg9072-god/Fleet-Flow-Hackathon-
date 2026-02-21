import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { getSocket } from '../../lib/socket'

const AnyMapContainer = MapContainer as any
const AnyTileLayer = TileLayer as any

type LiveTruck = {
  vehicleId: string
  driverId?: string | null
  lat: number
  lng: number
  speedKph: number
  timestamp: string
  vehicle?: { id: string; vehicleCode: string; type: string; status: string }
  driver?: { id: string; fullName: string; status: string; licenseCategory: string } | null
}

export const MapPage = () => {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['locations', 'TRUCK'],
    queryFn: async () => {
      const res = await api.get('/locations/live?type=TRUCK')
      return (res.data?.locations ?? []) as LiveTruck[]
    },
    refetchInterval: 10000,
  })
  const [positions, setPositions] = useState<Record<string, LiveTruck>>({})

  useEffect(() => {
    if (data) {
      const map: Record<string, LiveTruck> = {}
      for (const t of data) map[t.vehicleId] = t
      setPositions(map)
    }
  }, [data])

  useEffect(() => {
    const s = getSocket()
    const handler = (payload: LiveTruck) => {
      setPositions((prev) => ({ ...prev, [payload.vehicleId]: payload }))
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
            ...Object.values(positions).map((p) =>
              Math.max(0, Math.round((Date.now() - new Date(p.timestamp).getTime()) / 1000))
            )
          )}{' '}
          seconds
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <AnyMapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '70vh', width: '100%' }}
        >
          <AnyTileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {Object.values(positions).map((t) => (
            <Marker key={t.vehicleId} position={[t.lat, t.lng]}>
              <Tooltip>
                <div className="text-sm">
                  <div className="font-medium">{t.vehicle?.vehicleCode ?? t.vehicleId}</div>
                  <div>{t.driver?.fullName ?? 'Unassigned'}</div>
                  <div>Speed: {Math.round(t.speedKph)} kph</div>
                  <div>Last ping: {new Date(t.timestamp).toLocaleString()}</div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </AnyMapContainer>
      </div>
    </div>
  )
}
