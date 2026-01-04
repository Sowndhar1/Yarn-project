import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginRequest,
  registerRequest,
  fetchProfile,
  changePasswordRequest,
  updateProfileRequest,
} from "../lib/api.js";

const AuthContext = createContext(null);
const STORAGE_KEY = "yarn-auth-token";
const USER_TYPE_KEY = "yarn-user-type";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState(() => localStorage.getItem(USER_TYPE_KEY) || 'staff');
  const navigate = useNavigate();

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has access to everything
    return user.role === requiredRole;
  };

  // Check if user has any of the required roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin has access to everything
    return roles.includes(user.role);
  };

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { user: profile } = await fetchProfile(token);
        setUser(profile);
        // Redirect based on role after login
        if (window.location.pathname === '/login' || window.location.pathname === '/customer/login') {
          const redirectPath = getRedirectPath(profile.role);
          navigate(redirectPath, { replace: true });
        }
      } catch (err) {
        // Silently clear invalid/expired tokens (e.g., after database migration)
        console.warn("Auth token invalid or expired, clearing session");
        setToken(null);
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_TYPE_KEY);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, [token, navigate]);

  // Helper function to get redirect path based on role
  const getRedirectPath = (role) => {
    switch (role) {
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

  const login = async (identifier, password, type = 'staff') => {
    setError("");
    try {
      const result = await loginRequest(identifier, password, type);
      setToken(result.token);
      setUserType(type);
      localStorage.setItem(STORAGE_KEY, result.token);
      localStorage.setItem(USER_TYPE_KEY, type);
      setUser(result.user);
      return result.user;
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      throw err;
    }
  };

  const register = async (payload) => {
    setError("");
    try {
      const result = await registerRequest(payload);
      setToken(result.token);
      setUserType('customer');
      localStorage.setItem(STORAGE_KEY, result.token);
      localStorage.setItem(USER_TYPE_KEY, 'customer');
      setUser(result.user);
      return result.user;
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      throw err;
    }
  };

  const logout = () => {
    const currentUserType = userType;
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
    // Redirect to appropriate login page
    if (currentUserType === 'customer') {
      navigate('/customer/login');
    } else {
      navigate('/login');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) throw new Error("Not authenticated");
    await changePasswordRequest(token, currentPassword, newPassword);
  };

  const updateProfile = async (payload) => {
    if (!token) throw new Error("Not authenticated");
    try {
      const result = await updateProfileRequest(token, payload);
      setUser(result.user);
      return result.user;
    } catch (err) {
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      userType,
      hasRole,
      hasAnyRole,
      setError,
      login,
      logout,
      register,
      changePassword,
      updateProfile,
      setUser, // Export setUser
    }),
    [user, token, loading, error, userType]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
