import { useState } from 'react'
import { motion } from 'motion/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { getSocket } from '../../lib/socket'
import { useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export const DispatchPage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    cargoWeightKg: '',
    revenue: '',
    vehicleId: '',
    driverId: '',
  })
  const [completeTripId, setCompleteTripId] = useState<string | null>(null)
  const [endOdometerKm, setEndOdometerKm] = useState<string>('')

  const { data: availableVehicles } = useQuery({
    queryKey: ['vehicles', 'AVAILABLE'],
    queryFn: async () => (await api.get('/vehicles?status=AVAILABLE')).data,
  })
  const { data: availableDrivers } = useQuery({
    queryKey: ['drivers', 'ON_DUTY'],
    queryFn: async () => (await api.get('/drivers?status=ON_DUTY')).data,
  })
  const { data: drafts } = useQuery({
    queryKey: ['trips', 'DRAFT'],
    queryFn: async () => (await api.get('/trips?status=DRAFT')).data,
  })
  const { data: dispatched } = useQuery({
    queryKey: ['trips', 'DISPATCHED'],
    queryFn: async () => (await api.get('/trips?status=DISPATCHED')).data,
  })

  useEffect(() => {
    const s = getSocket()
    const refetch = () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    }
    s.on('trip:dispatched', refetch)
    s.on('trip:completed', refetch)
    s.on('vehicle:statusChanged', refetch)
    s.on('driver:statusChanged', refetch)
    return () => {
      s.off('trip:dispatched', refetch)
      s.off('trip:completed', refetch)
      s.off('vehicle:statusChanged', refetch)
      s.off('driver:statusChanged', refetch)
    }
  }, [queryClient])

  const createTrip = useMutation({
    mutationFn: async () =>
      (await api.post('/trips', {
        origin: form.origin,
        destination: form.destination,
        cargoWeightKg: Number(form.cargoWeightKg),
        revenue: form.revenue ? Number(form.revenue) : undefined,
        vehicleId: form.vehicleId,
        driverId: form.driverId,
      })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', 'DRAFT'] })
    },
  })

  const dispatchTrip = useMutation({
    mutationFn: async (id: string) => (await api.post(`/trips/${id}/dispatch`)).data,
    onSuccess: () => {
      toast.success('Trip dispatched')
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['drivers'] })
    },
    onError: (e: any) => {
      const code = e?.response?.data?.code
      if (code) toast.error(code)
      else toast.error('Dispatch failed')
    },
  })

  const completeTrip = useMutation({
    mutationFn: async ({ id, endOdometerKm }: { id: string; endOdometerKm: number }) =>
      (await api.post(`/trips/${id}/complete`, { endOdometerKm })).data,
    onSuccess: () => {
      setCompleteTripId(null)
      setEndOdometerKm('')
      toast.success('Trip completed')
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Complete failed')
    },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispatch</h1>
          <p className="text-gray-600">Create and manage trips</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Trip</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Trip</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              placeholder="Origin"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
            <input
              placeholder="Destination"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
            <input
              type="number"
              placeholder="Cargo Weight (kg)"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.cargoWeightKg}
              onChange={(e) => setForm({ ...form, cargoWeightKg: e.target.value })}
            />
            <input
              type="number"
              placeholder="Revenue (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.revenue}
              onChange={(e) => setForm({ ...form, revenue: e.target.value })}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="">Select Vehicle</option>
              {(availableVehicles ?? []).map((v: any) => (
                <option value={v.id} key={v.id}>
                  {v.code} ({v.capacityKg} kg)
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            >
              <option value="">Select Driver</option>
              {(availableDrivers ?? []).map((d: any) => (
                <option value={d.id} key={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => createTrip.mutate()}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Create
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Draft Trips</h3>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left">
                  <th className="px-4 py-2">Trip</th>
                  <th className="px-4 py-2">Vehicle</th>
                  <th className="px-4 py-2">Driver</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(drafts ?? []).map((t: any) => (
                  <tr key={t.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{t.tripCode}</td>
                    <td className="px-4 py-2">{t.vehicleCode}</td>
                    <td className="px-4 py-2">{t.driverName}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => dispatchTrip.mutate(t.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                      >
                        Dispatch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dispatched Trips</h3>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Trip</th>
                <th className="px-4 py-2">Vehicle</th>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(dispatched ?? []).map((t: any) => (
                <tr key={t.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{t.tripCode}</td>
                  <td className="px-4 py-2">{t.vehicleCode}</td>
                  <td className="px-4 py-2">{t.driverName}</td>
                  <td className="px-4 py-2">{t.startTime ? new Date(t.startTime).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setCompleteTripId(t.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {completeTripId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Trip</h3>
            <input
              type="number"
              placeholder="End Odometer (km)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              value={endOdometerKm}
              onChange={(e) => setEndOdometerKm(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCompleteTripId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  completeTrip.mutate({
                    id: completeTripId,
                    endOdometerKm: Number(endOdometerKm),
                  })
                }
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
