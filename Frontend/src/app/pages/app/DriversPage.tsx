import { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, MoreVertical, User, Star, Clock, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

type Driver = {
  id: string
  fullName: string
  phone?: string | null
  licenseNumber: string
  licenseExpiryDate: string
  licenseCategory: 'TRUCK' | 'VAN' | 'BIKE'
  status: 'ON_DUTY' | 'OFF_DUTY' | 'SUSPENDED' | 'ON_TRIP'
  safetyScore: number
}

type Metric = { driverId: string; totalTrips: number; completedTrips: number; completionRate: number; complaints: number }

function useDebounced<T>(value: T, delayMs: number) {
  const [v, setV] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

export const DriversPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebounced(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<'name' | 'safety' | 'completion'>('name');

  const { data: drivers } = useQuery({
    queryKey: ['drivers', statusFilter, searchQuery],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery) params.append('q', searchQuery);
      const qs = params.toString();
      const res = await api.get(qs ? `/drivers?${qs}` : '/drivers', { signal });
      return (res.data?.drivers ?? []) as Driver[];
    },
    enabled: !!user,
  });

  const { data: metrics } = useQuery({
    queryKey: ['drivers-metrics'],
    queryFn: async ({ signal }) => {
      const res = await api.get('/drivers/metrics', { signal });
      return (res.data?.metrics ?? []) as Metric[];
    },
    staleTime: 10000,
    enabled: !!user,
  });

  const metricsById = useMemo<Record<string, Metric>>(
    () => Object.fromEntries((metrics ?? []).map((m) => [m.driverId, m])),
    [metrics]
  );

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Driver['status'] }) =>
      (await api.patch(`/drivers/${id}/status`, { status })).data,
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || 'Failed to update status');
    },
  });

  const filteredDrivers = useMemo(() => {
    let d = drivers ?? [];
    if (sortKey === 'name') d = [...d].sort((a, b) => a.fullName.localeCompare(b.fullName));
    if (sortKey === 'safety') d = [...d].sort((a, b) => (b.safetyScore ?? 0) - (a.safetyScore ?? 0));
    if (sortKey === 'completion')
      d = [...d].sort(
        (a, b) => (metricsById[b.id]?.completionRate ?? 0) - (metricsById[a.id]?.completionRate ?? 0)
      );
    return d;
  }, [drivers, sortKey, metricsById]);

  const canManage = user?.role === 'FLEET_MANAGER' || user?.role === 'SAFETY_OFFICER' || user?.role === 'DISPATCHER';
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    licenseCategory: 'TRUCK' as Driver['licenseCategory'],
  });

  const createDriver = useMutation({
    mutationFn: async () => {
      if (!form.fullName || !form.licenseNumber || !form.licenseExpiryDate || !form.licenseCategory) {
        throw new Error('Please fill all required fields');
      }
      return (await api.post('/drivers', {
        fullName: form.fullName,
        phone: form.phone || undefined,
        licenseNumber: form.licenseNumber,
        licenseExpiryDate: form.licenseExpiryDate,
        licenseCategory: form.licenseCategory,
      })).data;
    },
    onSuccess: () => {
      toast.success('Driver added');
      setShowCreate(false);
      setForm({ fullName: '', phone: '', licenseNumber: '', licenseExpiryDate: '', licenseCategory: 'TRUCK' });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message || e?.message || 'Failed to add driver');
    },
  });

  const getStatusBadge = (status: Driver['status']) => {
    const styles: Record<Driver['status'], string> = {
      ON_DUTY: 'bg-green-100 text-green-700',
      OFF_DUTY: 'bg-gray-100 text-gray-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      ON_TRIP: 'bg-blue-100 text-blue-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drivers</h1>
          <p className="text-gray-600">Company driver directory and performance</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Driver</span>
          </button>
        )}
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
          <div className="text-3xl font-bold text-gray-900">{drivers?.length ?? 0}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">On Duty</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(drivers ?? []).filter((d) => d.status === 'ON_DUTY' || d.status === 'ON_TRIP').length}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Safety Score</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {drivers && drivers.length
              ? (drivers.reduce((sum, d) => sum + (d.safetyScore ?? 0), 0) / drivers.length).toFixed(1)
              : '0.0'}
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
            {(metrics ?? []).reduce((sum, m) => sum + (m.totalTrips ?? 0), 0)}
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
              placeholder="Search drivers by name or license..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="ON_DUTY">On Duty</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <div className="flex items-center justify-center space-x-2 px-3 py-2.5 border border-gray-300 rounded-lg">
              <Filter className="w-4 h-4" />
              <select
                className="outline-none"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as any)}
              >
                <option value="name">Sort by Name</option>
                <option value="safety">Sort by Safety</option>
                <option value="completion">Sort by Completion</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Driver</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="License number"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={form.licenseExpiryDate}
                  onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })}
                />
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  value={form.licenseCategory}
                  onChange={(e) => setForm({ ...form, licenseCategory: e.target.value as Driver['licenseCategory'] })}
                >
                  <option value="TRUCK">TRUCK</option>
                  <option value="VAN">VAN</option>
                  <option value="BIKE">BIKE</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => createDriver.mutate()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                >
                  {createDriver.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">License #</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Expiry</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Completion</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Safety</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Complaints</th>
                {canManage && <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((d, index) => {
                const m = metricsById[d.id];
                return (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {d.fullName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{d.fullName}</div>
                          <div className="text-xs text-gray-500">{d.phone ?? '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{d.licenseNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(d.licenseExpiryDate).toLocaleDateString()}
                      {new Date(d.licenseExpiryDate) < new Date() && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs">Expired</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{d.licenseCategory}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {m ? `${m.completionRate}% (${m.completedTrips}/${m.totalTrips})` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{d.safetyScore}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{m?.complaints ?? 0}</td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setStatus.mutate({ id: d.id, status: 'ON_DUTY' })}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            On Duty
                          </button>
                          <button
                            onClick={() => setStatus.mutate({ id: d.id, status: 'OFF_DUTY' })}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Off Duty
                          </button>
                          <button
                            onClick={() => setStatus.mutate({ id: d.id, status: 'SUSPENDED' })}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.patch(`/drivers/${d.id}/license`, {});
                                toast.success('License renewed for 1 year');
                                queryClient.invalidateQueries({ queryKey: ['drivers'] });
                              } catch (e: any) {
                                toast.error(e?.response?.data?.message || 'Failed to renew');
                              }
                            }}
                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Renew +1y
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
