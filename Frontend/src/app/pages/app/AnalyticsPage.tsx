import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Truck, Users, Clock } from 'lucide-react';
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

export const AnalyticsPage = () => {
  const performanceData = [
    { month: 'Jan', revenue: 125000, costs: 82000, deliveries: 1240 },
    { month: 'Feb', revenue: 132000, costs: 78000, deliveries: 1380 },
    { month: 'Mar', revenue: 148000, costs: 75000, deliveries: 1520 },
    { month: 'Apr', revenue: 156000, costs: 71000, deliveries: 1680 },
    { month: 'May', revenue: 165000, costs: 68000, deliveries: 1820 },
    { month: 'Jun', revenue: 178000, costs: 65000, deliveries: 1950 },
  ];

  const efficiencyData = [
    { day: 'Mon', onTime: 94, delayed: 6 },
    { day: 'Tue', onTime: 96, delayed: 4 },
    { day: 'Wed', onTime: 92, delayed: 8 },
    { day: 'Thu', onTime: 95, delayed: 5 },
    { day: 'Fri', onTime: 93, delayed: 7 },
    { day: 'Sat', onTime: 97, delayed: 3 },
    { day: 'Sun', onTime: 98, delayed: 2 },
  ];

  const driverPerformance = [
    { name: 'Mike J.', score: 98, deliveries: 147 },
    { name: 'Sarah W.', score: 96, deliveries: 132 },
    { name: 'Emily D.', score: 100, deliveries: 158 },
    { name: 'Jessica L.', score: 94, deliveries: 125 },
    { name: 'Robert M.', score: 92, deliveries: 118 },
  ];

  const stats = [
    {
      label: 'Total Revenue',
      value: '$178K',
      change: '+7.9%',
      trend: 'up',
      icon: DollarSign,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Operating Costs',
      value: '$65K',
      change: '-4.6%',
      trend: 'down',
      icon: TrendingDown,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Vehicles',
      value: '142',
      change: '+8.5%',
      trend: 'up',
      icon: Truck,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Driver Efficiency',
      value: '95%',
      change: '+2.1%',
      trend: 'up',
      icon: Users,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

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
            {driverPerformance.map((driver, index) => (
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
                <div className="text-2xl font-bold text-gray-900">95.6%</div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">680</div>
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