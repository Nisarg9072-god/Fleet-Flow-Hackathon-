import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Filter, MoreVertical, User, Star, Clock, TrendingUp } from 'lucide-react';

export const DriversPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const drivers = [
    {
      id: 1,
      name: 'Mike Johnson',
      email: 'mike.j@fleetops.com',
      phone: '(555) 123-4567',
      vehicle: 'Truck A-247',
      status: 'active',
      rating: 4.9,
      totalDeliveries: 1247,
      hoursThisWeek: 38,
      safetyScore: 98,
      joinDate: '2024-03-15',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      email: 'sarah.w@fleetops.com',
      phone: '(555) 234-5678',
      vehicle: 'Van B-189',
      status: 'active',
      rating: 4.8,
      totalDeliveries: 892,
      hoursThisWeek: 42,
      safetyScore: 96,
      joinDate: '2024-06-22',
    },
    {
      id: 3,
      name: 'David Chen',
      email: 'david.c@fleetops.com',
      phone: '(555) 345-6789',
      vehicle: 'Unassigned',
      status: 'off-duty',
      rating: 4.7,
      totalDeliveries: 1103,
      hoursThisWeek: 0,
      safetyScore: 94,
      joinDate: '2024-01-10',
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.d@fleetops.com',
      phone: '(555) 456-7890',
      vehicle: 'Truck D-112',
      status: 'active',
      rating: 5.0,
      totalDeliveries: 1589,
      hoursThisWeek: 40,
      safetyScore: 100,
      joinDate: '2023-11-05',
    },
    {
      id: 5,
      name: 'Robert Martinez',
      email: 'robert.m@fleetops.com',
      phone: '(555) 567-8901',
      vehicle: 'Truck E-455',
      status: 'on-break',
      rating: 4.6,
      totalDeliveries: 756,
      hoursThisWeek: 28,
      safetyScore: 92,
      joinDate: '2024-08-17',
    },
    {
      id: 6,
      name: 'Jessica Lee',
      email: 'jessica.l@fleetops.com',
      phone: '(555) 678-9012',
      vehicle: 'Van F-678',
      status: 'active',
      rating: 4.9,
      totalDeliveries: 1012,
      hoursThisWeek: 35,
      safetyScore: 97,
      joinDate: '2024-04-30',
    },
  ];

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      'off-duty': 'bg-gray-100 text-gray-700',
      'on-break': 'bg-orange-100 text-orange-700',
    };
    return styles[status as keyof typeof styles] || styles['off-duty'];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Active',
      'off-duty': 'Off Duty',
      'on-break': 'On Break',
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drivers</h1>
          <p className="text-gray-600">Manage your driver team and performance</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Driver</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Drivers</span>
            <User className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{drivers.length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active Now</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {drivers.filter((d) => d.status === 'active').length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Rating</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1)}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Hours</span>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {drivers.reduce((sum, d) => sum + d.hoursThisWeek, 0)}
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers by name, email, or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </button>
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver, index) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">{driver.rating}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(driver.status)}`}>
                {getStatusLabel(driver.status)}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium text-gray-900">{driver.vehicle}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Safety Score:</span>
                <span className="font-medium text-gray-900">{driver.safetyScore}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Hours This Week:</span>
                <span className="font-medium text-gray-900">{driver.hoursThisWeek}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Deliveries:</span>
                <span className="font-medium text-gray-900">{driver.totalDeliveries.toLocaleString()}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-gray-200 space-y-1">
              <div className="text-sm text-gray-600">{driver.email}</div>
              <div className="text-sm text-gray-600">{driver.phone}</div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                View Details
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium">
                Contact
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
