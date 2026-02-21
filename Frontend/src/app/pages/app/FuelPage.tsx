import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Fuel, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { getSocket } from '../../lib/socket';
import { format } from 'date-fns';
import { formatINR } from '../../lib/currency';

const LITERS_PER_GALLON = 3.78541;
type Tx = {
  id: string;
  vehicle: string;
  driver: string;
  date: string;
  location: string;
  gallons: number;
  price: number;
  total: number;
};

export const FuelPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: logs } = useQuery({
    queryKey: ['fuel'],
    queryFn: async () => {
      const res = await api.get('/fuel');
      return res.data?.logs ?? [];
    },
    staleTime: 30000,
  });

  useEffect(() => {
    const s = getSocket();
    const refetch = () => queryClient.invalidateQueries({ queryKey: ['fuel'] });
    s.on('fuel:added', refetch);
    return () => {
      s.off('fuel:added', refetch);
    };
  }, [queryClient]);

  const monthlyData = useMemo(() => {
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
    const totals: Record<string, { cost: number; gallons: number }> = Object.fromEntries(
      months.map((m) => [m.key, { cost: 0, gallons: 0 }])
    );
    (logs ?? []).forEach((l: any) => {
      const dt = new Date(l.fuelDate ?? l.createdAt);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      if (totals[key]) {
        totals[key].cost += Number(l.cost ?? 0);
        totals[key].gallons += Number(l.liters ?? 0) / LITERS_PER_GALLON;
      }
    });
    return months.map((m) => ({
      month: m.label,
      cost: Math.round(totals[m.key].cost),
      gallons: Math.round(totals[m.key].gallons),
    }));
  }, [logs]);

  const vehicleByType = useMemo(() => {
    const buckets: Record<string, number> = {};
    (logs ?? []).forEach((l: any) => {
      const type = l.vehicle?.type || 'UNKNOWN';
      buckets[type] = (buckets[type] || 0) + Number(l.liters ?? 0);
    });
    const colors: Record<string, string> = {
      TRUCK: '#6366f1',
      VAN: '#8b5cf6',
      BIKE: '#10b981',
      UNKNOWN: '#ec4899',
    };
    return Object.entries(buckets).map(([name, liters]) => ({
      name,
      value: Math.round((Number(liters) / LITERS_PER_GALLON) * 10) / 10,
      color: colors[name] || '#6366f1',
    }));
  }, [logs]);

  const recentTransactions = useMemo<Tx[]>(() => {
    return (logs ?? []).slice(0, 50).map((l: any) => {
      const gallons = Number(l.liters ?? 0) / LITERS_PER_GALLON;
      const total = Number(l.cost ?? 0);
      const price = gallons > 0 ? total / gallons : 0;
      return {
        id: l.id,
        vehicle: l.vehicle?.vehicleCode ?? l.vehicleId,
        driver: l.trip?.driver?.fullName ?? '-',
        date: format(new Date(l.fuelDate ?? l.createdAt), 'yyyy-MM-dd HH:mm'),
        location: '-',
        gallons,
        price,
        total,
      };
    });
  }, [logs]);

  const filteredTransactions = recentTransactions.filter(
    (tx: Tx) =>
      tx.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fuel Management</h1>
        <p className="text-gray-600">Track fuel consumption and optimize costs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Monthly Cost</span>
            <Fuel className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatINR(Math.round(monthlyData[5]?.cost ?? 0))}
          </div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>-9.4% from last month</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Gallons</span>
            <Fuel className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(Math.round((monthlyData[5]?.gallons ?? 0) * 10) / 10).toLocaleString()}
          </div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>-6.5% from last month</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Price/Gallon</span>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatINR(
              Number(
                (monthlyData[5]?.gallons ?? 0) > 0
                  ? (monthlyData[5]?.cost ?? 0) / (monthlyData[5]?.gallons ?? 1)
                  : 0
              )
            )}
          </div>
          <div className="flex items-center text-sm text-red-600 mt-2">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+2.1% from last month</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Fills This Month</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(logs ?? []).filter((l: any) => {
              const d = new Date(l.fuelDate ?? l.createdAt);
              const now = new Date();
              return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            }).length}
          </div>
          <div className="flex items-center text-sm text-green-600 mt-2">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+3.8% improvement</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Cost Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Fuel Cost Trend</h3>
            <p className="text-sm text-gray-600">Monthly fuel expenses and consumption</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cost"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCost)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Vehicle Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Fuel by Vehicle Type</h3>
            <p className="text-sm text-gray-600">Consumption distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={vehicleByType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {vehicleByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {vehicleByType.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value.toLocaleString()} gal</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Recent Transactions</h3>
              <p className="text-sm text-gray-600">Latest fuel purchases</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Driver</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date & Time</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Location</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Gallons</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Price/Gal</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{tx.vehicle}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.driver}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{tx.location}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {tx.gallons.toFixed(1)} gal
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900">
                    {formatINR(Number(tx.price))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                    {formatINR(Number(tx.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
