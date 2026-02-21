import { createBrowserRouter } from 'react-router';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/app/DashboardPage';
import { TrackingPage } from './pages/app/TrackingPage';
import { MapPage } from './pages/app/MapPage';
import { TrackerPage } from './pages/app/TrackerPage';
import { VehiclesPage } from './pages/app/VehiclesPage';
import { DriversPage } from './pages/app/DriversPage';
import { DispatchPage } from './pages/app/DispatchPage';
import { MaintenancePage } from './pages/app/MaintenancePage';
import { FuelPage } from './pages/app/FuelPage';
import { AnalyticsPage } from './pages/app/AnalyticsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LandingPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        Component: DashboardPage,
      },
      {
        path: 'map',
        element: (
          <RoleRoute allowed={['DISPATCHER', 'FLEET_MANAGER', 'SAFETY_OFFICER']}>
            <MapPage />
          </RoleRoute>
        ),
      },
      {
        path: 'vehicles',
        element: (
          <RoleRoute allowed={['FLEET_MANAGER']}>
            <VehiclesPage />
          </RoleRoute>
        ),
      },
      {
        path: 'drivers',
        element: (
          <RoleRoute allowed={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
            <DriversPage />
          </RoleRoute>
        ),
      },
      {
        path: 'dispatch',
        element: (
          <RoleRoute allowed={['DISPATCHER']}>
            <DispatchPage />
          </RoleRoute>
        ),
      },
      {
        path: 'tracker',
        element: (
          <RoleRoute allowed={['DISPATCHER']}>
            <TrackerPage />
          </RoleRoute>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <RoleRoute allowed={['FLEET_MANAGER']}>
            <MaintenancePage />
          </RoleRoute>
        ),
      },
      {
        path: 'fuel',
        element: (
          <RoleRoute allowed={['FINANCE_ANALYST', 'DISPATCHER']}>
            <FuelPage />
          </RoleRoute>
        ),
      },
      {
        path: 'analytics',
        Component: AnalyticsPage,
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);
