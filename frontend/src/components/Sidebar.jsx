import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BarChart3 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const isManager = user && (user.role === 'manager' || user.role === 'admin');

  return (
    <div className="w-64 bg-blue-700 text-white flex flex-col rounded-2xl shadow-lg my-4 ml-4 sticky top-4 h-[calc(100vh-2rem)]">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight">HallBooker</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {isManager && (
          <NavLink
            to="/dashboard/stats"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
              }`
            }
          >
            <BarChart3 size={20} />
            <span className="font-medium">Analytics</span>
          </NavLink>
        )}
        <NavLink
          to="/dashboard/halls"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Halls</span>
        </NavLink>
        <NavLink
          to="/dashboard/bookings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-blue-600/50 hover:text-white'
            }`
          }
        >
          <CalendarDays size={20} />
          <span className="font-medium">My Bookings</span>
        </NavLink>
      </nav>
      <div className="p-4 text-sm text-blue-200 text-center border-t border-blue-600">
        &copy; 2026 Hall Booking System
      </div>
    </div>
  );
};

export default Sidebar;
