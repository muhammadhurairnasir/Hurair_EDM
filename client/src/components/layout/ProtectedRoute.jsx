import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Let Layout handle global loading state

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is a system_admin trying to access POS, redirect to store or their default dashboard
    const redirectPath = user.role === 'system_admin' ? '/store' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
