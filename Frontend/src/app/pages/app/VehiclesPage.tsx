import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Plus, Filter, MoreVertical, Truck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export const VehiclesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const vehicles = [
    {
      id: 'A-247',
      name: 'Freightliner Cascadia',
      type: 'Semi Truck',
      status: 'active',
      driver: 'Mike Johnson',
      mileage: 142580,
      lastService: '2026-01-15',
      nextService: '2026-03-15',
      fuelLevel: 78,
    },
    {
      id: 'B-189',
      name: 'Mercedes Sprinter',
      type: 'Cargo Van',
      status: 'active',
      driver: 'Sarah Williams',
      mileage: 87340,
      lastService: '2026-02-01',
      nextService: '2026-04-01',
      fuelLevel: 45,
    },
    {
      id: 'C-334',
      name: 'Volvo VNL',
      type: 'Semi Truck',
      status: 'maintenance',
      driver: 'Unassigned',
      mileage: 198760,
      lastService: '2026-02-10',
      nextService: '2026-02-25',
      fuelLevel: 92,
    },
    {
      id: 'D-112',
      name: 'Ford Transit',
      type: 'Cargo Van',
      status: 'active',
      driver: 'Emily Davis',
      mileage: 54920,
      lastService: '2026-01-20',
      nextService: '2026-03-20',
      fuelLevel: 61,
    },
    {
      id: 'E-455',
      name: 'Peterbilt 579',
      type: 'Semi Truck',
      status: 'idle',
      driver: 'Robert Martinez',
      mileage: 175430,
      lastService: '2026-02-05',
      nextService: '2026-04-05',
      fuelLevel: 34,
    },
    {
      id: 'F-678',
      name: 'RAM ProMaster',
      type: 'Cargo Van',
      status: 'active',
      driver: 'Jessica Lee',
      mileage: 62100,
      lastService: '2026-01-28',
      nextService: '2026-03-28',
      fuelLevel: 88,
    },
  ];

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'idle':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      maintenance: 'bg-orange-100 text-orange-700',
      idle: 'bg-gray-100 text-gray-700',
    };
    return styles[status as keyof typeof styles] || styles.idle;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicles</h1>
          <p className="text-gray-600">Manage and monitor your entire fleet</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles, ID, or driver..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Vehicles</span>
            <Truck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {vehicles.filter((v) => v.status === 'active').length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Maintenance</span>
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {vehicles.filter((v) => v.status === 'maintenance').length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Idle</span>
            <XCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {vehicles.filter((v) => v.status === 'idle').length}
          </div>
        </motion.div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Driver</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Mileage</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Fuel</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Next Service</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVehicles.map((vehicle, index) => (
                <motion.tr
                  key={vehicle.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(vehicle.status)}
                      <div>
                        <div className="font-semibold text-gray-900">{vehicle.name}</div>
                        <div className="text-sm text-gray-500">ID: {vehicle.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(vehicle.status)}`}>
                      {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{vehicle.driver}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.mileage.toLocaleString()} mi</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            vehicle.fuelLevel > 50 ? 'bg-green-500' : vehicle.fuelLevel > 25 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${vehicle.fuelLevel}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{vehicle.fuelLevel}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{vehicle.nextService}</td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
