import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Map,
  Truck,
  Users,
  SendHorizontal,
  Wrench,
  Fuel,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard', roles: ['FLEET_MANAGER','DISPATCHER','SAFETY_OFFICER','FINANCE_ANALYST'] },
    { icon: Map, label: 'Live Map', path: '/app/map', roles: ['DISPATCHER','FLEET_MANAGER','SAFETY_OFFICER'] },
    { icon: Truck, label: 'Vehicles', path: '/app/vehicles', roles: ['FLEET_MANAGER'] },
    { icon: Users, label: 'Drivers', path: '/app/drivers', roles: ['FLEET_MANAGER','SAFETY_OFFICER','DISPATCHER'] },
    { icon: SendHorizontal, label: 'Dispatch', path: '/app/dispatch', roles: ['DISPATCHER'] },
    { icon: Navigation, label: 'Tracker', path: '/app/tracker', roles: ['DISPATCHER'] },
    { icon: Wrench, label: 'Maintenance', path: '/app/maintenance', roles: ['FLEET_MANAGER'] },
    { icon: Fuel, label: 'Fuel', path: '/app/fuel', roles: ['FINANCE_ANALYST','DISPATCHER'] },
    { icon: BarChart3, label: 'Analytics', path: '/app/analytics', roles: ['FLEET_MANAGER','DISPATCHER','SAFETY_OFFICER','FINANCE_ANALYST'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isSidebarCollapsed && (
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                FleetOps<sup className="text-xs">™</sup>
              </span>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isSidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.filter((m) => !user || m.roles.includes(user.role)).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <Link to="/app/dashboard" className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  FleetOps<sup className="text-xs">™</sup>
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="py-4">
              <ul className="space-y-1 px-3">
                {menuItems.filter((m) => !user || m.roles.includes(user.role)).map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0)}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
