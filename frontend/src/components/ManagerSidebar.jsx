import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BarChart3, User } from 'lucide-react';

const ManagerSidebar = () => {
  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col rounded-2xl shadow-lg my-4 ml-4 sticky top-4 h-[calc(100vh-2rem)]">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-indigo-100">Manager Area</h2>
        <p className="text-sm text-indigo-300 mt-1">HallBooker Admin</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <NavLink
          to="/manager/dashboard/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
            }`
          }
        >
          <BarChart3 size={20} />
          <span className="font-medium">Analytics</span>
        </NavLink>
        <NavLink
          to="/manager/dashboard/halls"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Manage Halls</span>
        </NavLink>
        <NavLink
          to="/manager/dashboard/bookings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
            }`
          }
        >
          <CalendarDays size={20} />
          <span className="font-medium">Bookings</span>
        </NavLink>
        <NavLink
          to="/manager/dashboard/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-indigo-200 hover:bg-indigo-700/50 hover:text-white'
            }`
          }
        >
          <User size={20} />
          <span className="font-medium">Profile</span>
        </NavLink>
      </nav>
      <div className="p-4 text-sm text-indigo-400 text-center border-t border-indigo-800">
        &copy; 2026 HallBooker
      </div>
    </div>
  );
};

export default ManagerSidebar;
