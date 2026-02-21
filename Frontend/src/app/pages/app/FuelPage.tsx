import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Fuel, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const FuelPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const monthlyData = [
    { month: 'Jan', cost: 45000, gallons: 8200 },
    { month: 'Feb', cost: 42000, gallons: 7800 },
    { month: 'Mar', cost: 38000, gallons: 7200 },
    { month: 'Apr', cost: 35000, gallons: 6800 },
    { month: 'May', cost: 32000, gallons: 6200 },
    { month: 'Jun', cost: 29000, gallons: 5800 },
  ];

  const vehicleEfficiency = [
    { name: 'Semi Trucks', value: 42, color: '#6366f1' },
    { name: 'Cargo Vans', value: 28, color: '#8b5cf6' },
    { name: 'Delivery Vans', value: 18, color: '#ec4899' },
    { name: 'Box Trucks', value: 12, color: '#10b981' },
  ];

  const recentTransactions = [
    {
      id: 1,
      vehicle: 'Truck A-247',
      driver: 'Mike Johnson',
      date: '2026-02-21 08:30',
      location: 'Shell Station - Downtown',
      gallons: 85.2,
      price: 3.45,
      total: 293.94,
    },
    {
      id: 2,
      vehicle: 'Van B-189',
      driver: 'Sarah Williams',
      date: '2026-02-21 07:15',
      location: 'BP - Highway Exit 42',
      gallons: 42.8,
      price: 3.52,
      total: 150.66,
    },
    {
      id: 3,
      vehicle: 'Truck D-112',
      driver: 'Emily Davis',
      date: '2026-02-20 18:45',
      location: 'Chevron - Industrial Park',
      gallons: 78.5,
      price: 3.48,
      total: 273.18,
    },
    {
      id: 4,
      vehicle: 'Van F-678',
      driver: 'Jessica Lee',
      date: '2026-02-20 16:20',
      location: 'Mobil - North Side',
      gallons: 38.2,
      price: 3.55,
      total: 135.61,
    },
    {
      id: 5,
      vehicle: 'Truck E-455',
      driver: 'Robert Martinez',
      date: '2026-02-20 14:10',
      location: 'Shell Station - Airport',
      gallons: 92.3,
      price: 3.42,
      total: 315.67,
    },
  ];

  const filteredTransactions = recentTransactions.filter(
    (tx) =>
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
          <div className="text-3xl font-bold text-gray-900">$29,000</div>
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
          <div className="text-3xl font-bold text-gray-900">5,800</div>
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
          <div className="text-3xl font-bold text-gray-900">$3.48</div>
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
            <span className="text-sm text-gray-600">Fleet MPG</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">8.2</div>
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
                data={vehicleEfficiency}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {vehicleEfficiency.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {vehicleEfficiency.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
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
                    ${tx.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                    ${tx.total.toFixed(2)}
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
