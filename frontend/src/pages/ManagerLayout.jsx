import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import ManagerSidebar from '../components/ManagerSidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

const ManagerLayout = () => {
  const { user } = useContext(AuthContext);

  // Extra safety check in the layout itself, though ManagerProtectedRoute handles the main check
  if (user?.role !== 'manager') {
    return <Navigate to="/dashboard/halls" replace />;
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-8 pb-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
