import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

type Role =
  | 'FLEET_MANAGER'
  | 'DISPATCHER'
  | 'SAFETY_OFFICER'
  | 'FINANCE_ANALYST'

export const RoleRoute = ({
  children,
  allowed,
}: {
  children: React.ReactNode
  allowed: Role[]
}) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowed.includes(user.role)) return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}
