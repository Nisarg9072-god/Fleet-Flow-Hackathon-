import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { getSocket } from '../../lib/socket'
import { toast } from 'sonner'

export const MaintenancePage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    vehicleId: '',
    serviceType: '',
    cost: '',
    serviceDate: '',
    vendor: '',
    notes: '',
  })

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', 'ALL'],
    queryFn: async () => (await api.get('/vehicles')).data,
  })
  const { data: maintenance } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => (await api.get('/maintenance')).data,
  })

  useEffect(() => {
    const s = getSocket()
    const refetch = () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    }
    s.on('maintenance:logged', refetch)
    s.on('vehicle:statusChanged', refetch)
    return () => {
      s.off('maintenance:logged', refetch)
      s.off('vehicle:statusChanged', refetch)
    }
  }, [queryClient])

  const create = useMutation({
    mutationFn: async () =>
      (await api.post('/maintenance', {
        vehicleId: form.vehicleId,
        serviceType: form.serviceType,
        cost: Number(form.cost),
        serviceDate: form.serviceDate,
        vendor: form.vendor || undefined,
        notes: form.notes,
      })).data,
    onSuccess: () => {
      toast.success('Maintenance logged')
      setForm({
        vehicleId: '',
        serviceType: '',
        cost: '',
        serviceDate: '',
        vendor: '',
        notes: '',
      })
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to log maintenance')
    },
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance</h1>
          <p className="text-gray-600">Track and schedule vehicle maintenance</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Maintenance</h3>
          <div className="grid gap-3">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
            >
              <option value="">Select vehicle</option>
              {(vehicles ?? []).map((v: any) => (
                <option key={v.id} value={v.id}>
                  {v.code}
                </option>
              ))}
            </select>
            <input
              placeholder="Service Type"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.serviceType}
              onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
            />
            <input
              type="number"
              placeholder="Cost"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
            />
            <input
              type="date"
              placeholder="Service Date"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.serviceDate}
              onChange={(e) => setForm({ ...form, serviceDate: e.target.value })}
            />
            <input
              placeholder="Vendor (optional)"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.vendor}
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <button
              onClick={() => create.mutate()}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Log</h3>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="text-left">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Vehicle</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Cost</th>
                  <th className="px-4 py-2">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {(maintenance ?? []).map((m: any) => (
                  <tr key={m.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{m.serviceDate}</td>
                    <td className="px-4 py-2">{m.vehicleCode}</td>
                    <td className="px-4 py-2">{m.serviceType}</td>
                    <td className="px-4 py-2">{m.cost}</td>
                    <td className="px-4 py-2">{m.vendor || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
