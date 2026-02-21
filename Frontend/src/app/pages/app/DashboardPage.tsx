import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { getSocket } from '../../lib/socket'
import { format } from 'date-fns'
import {
  Truck,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

export const DashboardPage = () => {
  const queryClient = useQueryClient()
  const [tripStatus, setTripStatus] = useState<'DISPATCHED' | 'DRAFT' | 'COMPLETED'>('DISPATCHED')

  const { data: kpis } = useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      const res = await api.get('/dashboard/kpis')
      return res.data?.kpis ?? {}
    },
    staleTime: 10000,
  })

  const { data: trips } = useQuery({
    queryKey: ['trips', tripStatus],
    queryFn: async () => {
      const res = await api.get(`/trips?status=${tripStatus}`)
      return res.data?.trips ?? []
    },
  })
  const { data: fuelLogs } = useQuery({
    queryKey: ['fuel'],
    queryFn: async () => {
      const res = await api.get('/fuel')
      return res.data?.logs ?? []
    },
    staleTime: 30000,
  })

  useEffect(() => {
    const s = getSocket()
    const refetch = () => {
      queryClient.invalidateQueries({ queryKey: ['kpis'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    }
    const refetchFuel = () => {
      queryClient.invalidateQueries({ queryKey: ['fuel'] })
    }
    s.on('trip:dispatched', refetch)
    s.on('trip:completed', refetch)
    s.on('vehicle:statusChanged', refetch)
    s.on('driver:statusChanged', refetch)
    s.on('maintenance:logged', refetch)
    s.on('fuel:added', refetchFuel)
    return () => {
      s.off('trip:dispatched', refetch)
      s.off('trip:completed', refetch)
      s.off('vehicle:statusChanged', refetch)
      s.off('driver:statusChanged', refetch)
      s.off('maintenance:logged', refetch)
      s.off('fuel:added', refetchFuel)
    }
  }, [queryClient])

  const stats = useMemo(
    () => [
      {
        label: 'Total Fleet',
        value: kpis?.totalFleet ?? '-',
        change: '',
        trend: 'up',
        icon: Truck,
        bgColor: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
      },
      {
        label: 'Active Fleet',
        value: kpis?.activeFleet ?? '-',
        change: '',
        trend: 'up',
        icon: Users,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Maintenance Alerts',
        value: kpis?.maintenanceAlerts ?? '-',
        change: '',
        trend: 'up',
        icon: AlertTriangle,
        bgColor: 'bg-orange-100',
        iconColor: 'text-orange-600',
      },
      {
        label: 'Utilization Rate',
        value: kpis?.utilizationRate ? `${kpis.utilizationRate}%` : '-',
        change: '',
        trend: 'up',
        icon: Activity,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
      },
    ],
    [kpis]
  )

  const fleetActivity = useMemo(() => {
    const bins = [
      { label: '00:00', start: 0, end: 3 },
      { label: '04:00', start: 4, end: 7 },
      { label: '08:00', start: 8, end: 11 },
      { label: '12:00', start: 12, end: 15 },
      { label: '16:00', start: 16, end: 19 },
      { label: '20:00', start: 20, end: 23 },
      { label: '23:59', start: 23, end: 23 },
    ]
    const counts = bins.map(() => 0)
    ;(trips ?? []).forEach((t: any) => {
      if (!t?.startTime) return
      const h = new Date(t.startTime).getHours()
      bins.forEach((b, i) => {
        if (h >= b.start && h <= b.end) counts[i] += 1
      })
    })
    return bins.map((b, i) => ({ time: b.label, active: counts[i] }))
  }, [trips])

  const fuelData = useMemo(() => {
    // last 6 months including current
    const now = new Date()
    const months: { key: string; label: string; y: number; m: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: format(d, 'MMM'),
        y: d.getFullYear(),
        m: d.getMonth(),
      })
    }
    const totals: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]))
    ;(fuelLogs ?? []).forEach((l: any) => {
      const d = new Date(l.fuelDate ?? l.createdAt ?? l.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (key in totals) totals[key] += Number(l.cost ?? 0)
    })
    return months.map((m) => ({ month: m.label, cost: Math.round(totals[m.key]) }))
  }, [fuelLogs])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Real-time overview of your fleet operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="flex items-center text-sm font-medium text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Trips</h3>
            <p className="text-sm text-gray-600">Live dispatched trips</p>
          </div>
          <select
            value={tripStatus}
            onChange={(e) => setTripStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="DRAFT">Draft</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Trip Code</th>
                <th className="px-4 py-2">Vehicle</th>
                <th className="px-4 py-2">Driver</th>
                <th className="px-4 py-2">Origin</th>
                <th className="px-4 py-2">Destination</th>
                <th className="px-4 py-2">Cargo (kg)</th>
                <th className="px-4 py-2">Start Time</th>
              </tr>
            </thead>
            <tbody>
              {(trips ?? []).map((t: any) => (
                <tr key={t.id} className="border-t border-gray-200">
                  <td className="px-4 py-2">{t.tripCode}</td>
                  <td className="px-4 py-2">{t.vehicle?.vehicleCode ?? t.vehicleCode}</td>
                  <td className="px-4 py-2">{t.driver?.fullName ?? t.driverName}</td>
                  <td className="px-4 py-2">{t.origin}</td>
                  <td className="px-4 py-2">{t.destination}</td>
                  <td className="px-4 py-2">{t.cargoWeightKg}</td>
                  <td className="px-4 py-2">{t.startTime ? new Date(t.startTime).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Fleet Activity</h3>
            <p className="text-sm text-gray-600">Active vehicles throughout the day</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fleetActivity}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorActive)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Fuel Cost Trend</h3>
            <p className="text-sm text-gray-600">Monthly fuel expenses (INR)</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  )
}
