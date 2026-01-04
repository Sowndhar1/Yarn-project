import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();
  const { user, loading, hasRole, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-500">
        Checking access…
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login page based on requested roles
    const loginPath = roles?.includes('customer') ? '/customer/login' : '/login';
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // Check if user has required role(s)
  if (roles && roles.length) {
    if (!hasAnyRole(roles)) {
      // User is logged in but doesn't have required role
      // Redirect to appropriate page based on user's role
      const getRedirectPath = (userRole) => {
        switch (userRole) {
          case 'admin':
            return '/admin';
          case 'sales_staff':
            return '/sales';
          case 'inventory_staff':
            return '/inventory';
          case 'customer':
            return '/my-account';
          default:
            return '/';
        }
      };
      
      return <Navigate to={getRedirectPath(user.role)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
