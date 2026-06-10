import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HallsListing from './pages/HallsListing';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

import ManagerLayout from './pages/ManagerLayout';
import ManagerAnalytics from './pages/ManagerAnalytics';
import ManagerHalls from './pages/ManagerHalls';
import ManagerBookings from './pages/ManagerBookings';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminHalls from './pages/admin/AdminHalls';
import AdminBookings from './pages/admin/AdminBookings';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ManagerProtectedRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'manager') {
    return <Navigate to="/dashboard/halls" replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { token, user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard/halls" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/halls" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="halls" replace />} />
        <Route path="halls" element={<HallsListing />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bookings" element={<MyBookings />} />
      </Route>

      <Route
        path="/manager/dashboard"
        element={
          <ManagerProtectedRoute>
            <ManagerLayout />
          </ManagerProtectedRoute>
        }
      >
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics" element={<ManagerAnalytics />} />
        <Route path="halls" element={<ManagerHalls />} />
        <Route path="bookings" element={<ManagerBookings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="analytics" replace />} />
        <Route path="analytics" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="halls" element={<AdminHalls />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
