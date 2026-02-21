import { MapContainer, TileLayer, Marker, Tooltip, Polyline } from 'react-leaflet'
import { useEffect, useMemo, useState } from 'react'
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
  const { data: liveTrips } = useQuery({
    queryKey: ['trips', 'DISPATCHED'],
    queryFn: async () => {
      const res = await api.get('/trips?status=DISPATCHED')
      return res.data?.trips ?? []
    },
    staleTime: 10000,
  })
  const [positions, setPositions] = useState<Record<string, LiveTruck>>({})
  const [tripByVehicle, setTripByVehicle] = useState<Record<string, any>>({})
  const [showTiles, setShowTiles] = useState(false)
  const [showRoutes, setShowRoutes] = useState(true)
  const [routes, setRoutes] = useState<Record<string, { dest: [number, number]; origin?: [number, number] }>>({})
  const [loadingRouteFor, setLoadingRouteFor] = useState<Record<string, boolean>>({})
  const tiles = useMemo(
    () => [
      {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        subdomains: ['a', 'b', 'c'],
      },
      {
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
      },
      {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: ['a', 'b', 'c', 'd'],
      },
    ],
    []
  )
  const [tileIdx, setTileIdx] = useState(2)
  const [focusedVehicleId, setFocusedVehicleId] = useState<string | null>(null)
  const [mapRef, setMapRef] = useState<any>(null)

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const v = sp.get('vehicleId')
    const showRoutesParam = sp.get('showRoutes')
    if (v) setFocusedVehicleId(v)
    if (showRoutesParam === '1') setShowRoutes(true)
  }, [])

  useEffect(() => {
    if (data) {
      const map: Record<string, LiveTruck> = {}
      for (const t of data) map[t.vehicleId] = t
      setPositions(map)
    }
  }, [data])
  useEffect(() => {
    const map: Record<string, any> = {}
    ;(liveTrips ?? []).forEach((t: any) => {
      map[t.vehicleId] = t
    })
    setTripByVehicle(map)
  }, [liveTrips])

  useEffect(() => {
    const s = getSocket()
    const handler = (payload: LiveTruck) => {
      setPositions((prev) => ({ ...prev, [payload.vehicleId]: payload }))
    }
    const refetchTrips = () => queryClient.invalidateQueries({ queryKey: ['trips', 'DISPATCHED'] })
    s.on('location:update', handler)
    s.on('trip:dispatched', refetchTrips)
    s.on('trip:completed', refetchTrips)
    return () => {
      s.off('location:update', handler)
      s.off('trip:dispatched', refetchTrips)
      s.off('trip:completed', refetchTrips)
    }
  }, [])

  // simple in-memory geocode cache to reduce requests
  const [geoCache, setGeoCache] = useState<Record<string, [number, number]>>({})
  async function geocode(place: string): Promise<[number, number] | null> {
    const key = place.trim().toLowerCase()
    if (geoCache[key]) return geoCache[key]
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      })
      if (!res.ok) return null
      const data = await res.json()
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        setGeoCache((prev) => ({ ...prev, [key]: [lat, lon] }))
        return [lat, lon]
      }
    } catch {
      // ignore
    }
    return null
  }

  // compute routes: current position -> destination (and origin marker)
  useEffect(() => {
    if (!showRoutes) return
    const vehicles = Object.values(positions)
    vehicles.forEach(async (pos) => {
      const trip = tripByVehicle[pos.vehicleId]
      if (!trip || !trip.destination) return
      if (loadingRouteFor[pos.vehicleId]) return
      setLoadingRouteFor((p) => ({ ...p, [pos.vehicleId]: true }))
      const dest = await geocode(trip.destination)
      const ori = trip.origin ? await geocode(trip.origin) : null
      if (dest) {
        setRoutes((prev) => ({ ...prev, [pos.vehicleId]: { dest, origin: ori ?? undefined } }))
      }
      setLoadingRouteFor((p) => {
        const { [pos.vehicleId]: _, ...rest } = p
        return rest
      })
    })
  }, [positions, tripByVehicle, showRoutes, loadingRouteFor])

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
        <button
          onClick={() => setShowTiles((v) => !v)}
          className="ml-4 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          {showTiles ? 'Hide Basemap' : 'Show Basemap'}
        </button>
        <button
          onClick={() => setShowRoutes((v) => !v)}
          className="ml-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          {showRoutes ? 'Hide Routes' : 'Show Routes'}
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <AnyMapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '70vh', width: '100%' }}
          whenCreated={setMapRef}
        >
          {showTiles && (
            <AnyTileLayer
              key={tiles[tileIdx]?.url || 'tiles'}
              attribution={tiles[tileIdx]?.attribution}
              url={tiles[tileIdx]?.url}
              subdomains={tiles[tileIdx]?.subdomains}
              crossOrigin="anonymous"
              eventHandlers={{
                tileerror: () => setTileIdx((i: number) => Math.min(i + 1, tiles.length - 1)),
              }}
            />
          )}
          {Object.values(positions).map((t) => (
            <Marker key={t.vehicleId} position={[t.lat, t.lng]}>
              <Tooltip>
                <div className="text-sm">
                  <div className="font-medium">{t.vehicle?.vehicleCode ?? t.vehicleId}</div>
                  <div>{t.driver?.fullName ?? 'Unassigned'}</div>
                  <div>Speed: {Math.round(t.speedKph)} kph</div>
                  <div>Last ping: {new Date(t.timestamp).toLocaleString()}</div>
                  {tripByVehicle[t.vehicleId] && (
                    <div className="mt-1">
                      <div>Origin: {tripByVehicle[t.vehicleId].origin}</div>
                      <div>Destination: {tripByVehicle[t.vehicleId].destination}</div>
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          ))}
          {focusedVehicleId && positions[focusedVehicleId] && mapRef && mapRef.setView
            ? (mapRef.setView([positions[focusedVehicleId].lat, positions[focusedVehicleId].lng], 8), null)
            : null}
          {showRoutes &&
            Object.values(positions).map((p) => {
              const r = routes[p.vehicleId]
              if (!r) return null
              const path: [number, number][] = [
                [p.lat, p.lng],
                r.dest,
              ]
              return (
                <Polyline key={`route-${p.vehicleId}`} positions={path} pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.7 }} />
              )
            })}
          {showRoutes &&
            Object.entries(routes).map(([vehicleId, r]) =>
              r.origin ? (
                <Marker key={`orig-${vehicleId}`} position={r.origin}>
                  <Tooltip>Origin</Tooltip>
                </Marker>
              ) : null
            )}
          {showRoutes &&
            Object.entries(routes).map(([vehicleId, r]) => (
              <Marker key={`dest-${vehicleId}`} position={r.dest}>
                <Tooltip>Destination</Tooltip>
              </Marker>
            ))}
        </AnyMapContainer>
      </div>
    </div>
  )
}
