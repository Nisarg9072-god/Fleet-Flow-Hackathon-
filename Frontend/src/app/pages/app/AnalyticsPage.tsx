import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, IndianRupee, Truck, Users } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { format } from 'date-fns';
import { formatINR } from '../../lib/currency';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

 type DriverPerf = { name: string; score: number; deliveries: number };

export const AnalyticsPage = () => {
  const queryClient = useQueryClient();
  const { data: trips } = useQuery({
    queryKey: ['trips', 'COMPLETED'],
    queryFn: async () => {
      const res = await api.get('/trips?status=COMPLETED');
      return res.data?.trips ?? [];
    },
    staleTime: 15000,
  });
  const { data: fuel } = useQuery({
    queryKey: ['fuel'],
    queryFn: async () => {
      const res = await api.get('/fuel');
      return res.data?.logs ?? [];
    },
    staleTime: 30000,
  });
  const { data: maintenance } = useQuery({
    queryKey: ['maintenance'],
    queryFn: async () => {
      const res = await api.get('/maintenance');
      return res.data?.logs ?? [];
    },
    staleTime: 30000,
  });
  const { data: vehiclesOnTrip } = useQuery({
    queryKey: ['vehicles', 'ON_TRIP'],
    queryFn: async () => {
      const res = await api.get('/vehicles?status=ON_TRIP');
      return res.data?.vehicles ?? [];
    },
    staleTime: 10000,
  });
  const { data: driverMetrics } = useQuery({
    queryKey: ['drivers', 'metrics'],
    queryFn: async () => {
      const res = await api.get('/drivers/metrics');
      return res.data?.metrics ?? [];
    },
    staleTime: 30000,
  });
  const { data: drivers } = useQuery({
    queryKey: ['drivers', 'ALL'],
    queryFn: async () => {
      const res = await api.get('/drivers');
      return res.data?.drivers ?? [];
    },
    staleTime: 60000,
  });

  useEffect(() => {
    const s = getSocket();
    const refetchTrips = () => queryClient.invalidateQueries({ queryKey: ['trips'] });
    const refetchVehicles = () => queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    const refetchMaintenance = () => queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    const refetchFuel = () => queryClient.invalidateQueries({ queryKey: ['fuel'] });
    const refetchDrivers = () => queryClient.invalidateQueries({ queryKey: ['drivers'] });
    s.on('trip:dispatched', refetchTrips);
    s.on('trip:completed', refetchTrips);
    s.on('vehicle:statusChanged', refetchVehicles);
    s.on('maintenance:logged', refetchMaintenance);
    s.on('fuel:added', refetchFuel);
    s.on('driver:statusChanged', refetchDrivers);
    return () => {
      s.off('trip:dispatched', refetchTrips);
      s.off('trip:completed', refetchTrips);
      s.off('vehicle:statusChanged', refetchVehicles);
      s.off('maintenance:logged', refetchMaintenance);
      s.off('fuel:added', refetchFuel);
      s.off('driver:statusChanged', refetchDrivers);
    };
  }, [queryClient]);

  const performanceData = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; y: number; m: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: format(d, 'MMM'),
        y: d.getFullYear(),
        m: d.getMonth(),
      });
    }
    const totals: Record<string, { revenue: number; costs: number; deliveries: number }> = Object.fromEntries(
      months.map((m) => [m.key, { revenue: 0, costs: 0, deliveries: 0 }])
    );
    (trips ?? []).forEach((t: any) => {
      const dt = new Date(t.endTime ?? t.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (totals[key]) {
        totals[key].revenue += Number(t.revenue ?? 0);
        totals[key].deliveries += 1;
      }
    });
    (fuel ?? []).forEach((f: any) => {
      const dt = new Date(f.fuelDate ?? f.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (totals[key]) totals[key].costs += Number(f.cost ?? 0);
    });
    (maintenance ?? []).forEach((m: any) => {
      const dt = new Date(m.serviceDate ?? m.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (totals[key]) totals[key].costs += Number(m.cost ?? 0);
    });
    return months.map((m) => ({
      month: m.label,
      revenue: Math.round(totals[m.key].revenue),
      costs: Math.round(totals[m.key].costs),
      deliveries: totals[m.key].deliveries,
    }));
  }, [trips, fuel, maintenance]);

  const efficiencyData = useMemo(() => {
    const days: { label: string; date: Date }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push({ label: format(d, 'EEE'), date: d });
    }
    const buckets = days.map(() => ({ on: 0, delayed: 0 }));
    (trips ?? []).forEach((t: any) => {
      if (!t.startTime || !t.endTime) return;
      const end = new Date(t.endTime);
      const start = new Date(t.startTime);
      const durHrs = (end.getTime() - start.getTime()) / 3600000;
      const idx = days.findIndex((d) => d.date.toDateString() === end.toDateString());
      if (idx >= 0) {
        if (durHrs <= 8) buckets[idx].on += 1;
        else buckets[idx].delayed += 1;
      }
    });
    return days.map((d, i) => {
      const total = buckets[i].on + buckets[i].delayed;
      const onPct = total ? Math.round((buckets[i].on / total) * 100) : 0;
      const delayedPct = total ? 100 - onPct : 0;
      return { day: d.label, onTime: onPct, delayed: delayedPct };
    });
  }, [trips]);

  const driverPerformance = useMemo<DriverPerf[]>(() => {
    const byId: Record<string, any> = {};
    (drivers ?? []).forEach((d: any) => (byId[d.id] = d));
    const list = (driverMetrics ?? []).map((m: any) => ({
      name: byId[m.driverId]?.fullName ?? m.driverId.slice(0, 6),
      score: Number(m.completionRate ?? 0),
      deliveries: Number(m.completedTrips ?? 0),
    }));
    list.sort((a: any, b: any) => b.score - a.score);
    return list.slice(0, 5);
  }, [driverMetrics, drivers]);

  const stats = useMemo(() => {
    const now = new Date();
    const since = new Date(now.getTime() - 30 * 24 * 3600000);
    let rev = 0;
    (trips ?? []).forEach((t: any) => {
      const d = new Date(t.endTime ?? t.createdAt);
      if (d >= since) rev += Number(t.revenue ?? 0);
    });
    let costs = 0;
    (fuel ?? []).forEach((f: any) => {
      const d = new Date(f.fuelDate ?? f.createdAt);
      if (d >= since) costs += Number(f.cost ?? 0);
    });
    (maintenance ?? []).forEach((m: any) => {
      const d = new Date(m.serviceDate ?? m.createdAt);
      if (d >= since) costs += Number(m.cost ?? 0);
    });
    const avgEff =
      (driverMetrics && driverMetrics.length
        ? Math.round(
            (driverMetrics.reduce((acc: number, m: any) => acc + Number(m.completionRate ?? 0), 0) /
              driverMetrics.length) *
              10
          ) / 10
        : 0) + '%';
    return [
      {
        label: 'Total Revenue',
        value: formatINR(Math.round(rev)),
        change: '',
        trend: 'up',
        icon: IndianRupee,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      {
        label: 'Operating Costs',
        value: formatINR(Math.round(costs)),
        change: '',
        trend: 'down',
        icon: TrendingDown,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      {
        label: 'Active Vehicles',
        value: String((vehiclesOnTrip ?? []).length),
        change: '',
        trend: 'up',
        icon: Truck,
        bgColor: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
      },
      {
        label: 'Driver Efficiency',
        value: avgEff,
        change: '',
        trend: 'up',
        icon: Users,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
      },
    ];
  }, [trips, fuel, maintenance, vehiclesOnTrip, driverMetrics]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into fleet performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-blue-600'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {stat.change}
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Costs Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Revenue vs Operating Costs</h3>
          <p className="text-sm text-gray-600">Monthly comparison over the last 6 months</p>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenue"
            />
            <Area
              type="monotone"
              dataKey="costs"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCosts)"
              name="Costs"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Delivery Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delivery Performance</h3>
            <p className="text-sm text-gray-600">On-time vs delayed deliveries by day</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" fill="#10b981" radius={[4, 4, 0, 0]} name="On Time %" />
              <Bar dataKey="delayed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Delayed %" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Drivers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Performing Drivers</h3>
            <p className="text-sm text-gray-600">Performance score and delivery count</p>
          </div>
          <div className="space-y-4">
            {driverPerformance.map((driver: DriverPerf, index: number) => (
              <div key={driver.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{driver.name}</div>
                    <div className="text-sm text-gray-600">{driver.deliveries} deliveries</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Score</div>
                    <div className="text-xl font-bold text-gray-900">{driver.score}%</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${driver.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {driverMetrics && driverMetrics.length
                  ? Math.round(
                      driverMetrics.reduce((acc: number, m: any) => acc + Number(m.completionRate ?? 0), 0) /
                        driverMetrics.length
                    )
                  : 0}
                %
              </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(trips ?? []).length}
                </div>
                <div className="text-sm text-gray-600">Total Deliveries</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Deliveries Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Delivery Volume Trend</h3>
          <p className="text-sm text-gray-600">Monthly delivery count growth</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="deliveries"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 5 }}
              activeDot={{ r: 7 }}
              name="Deliveries"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};
