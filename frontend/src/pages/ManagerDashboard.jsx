import React, { useState, useEffect } from 'react';
import { Users, Building, DollarSign, Calendar, TrendingUp, PieChart, Loader2 } from 'lucide-react';
import api from '../services/api';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/manager/dashboard');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard metrics. Ensure you are logged in as a Manager.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-blue-600">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <p className="font-medium text-gray-500">Loading dashboard intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 max-w-lg mx-auto mt-12 text-center">
        <p className="font-semibold text-lg mb-2">Access Denied</p>
        <p className="text-sm mb-4">{error}</p>
      </div>
    );
  }

  // Calculate booking status distribution total for percentages
  const bookingStatusTotal = Object.values(stats.booking_status_distribution || {}).reduce((a, b) => a + b, 0);
  
  // Calculate hall status distribution total for percentages
  const hallStatusTotal = Object.values(stats.hall_status_distribution || {}).reduce((a, b) => a + b, 0);

  // Maximum value for SVG chart height scaling
  const maxBookingsVal = Math.max(...(stats.yearly_booking_trend || []).map(d => d.bookings), 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
          <p className="text-gray-500 mt-1">Real-time statistics, booking distribution, and earnings analysis.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100 flex items-center gap-2">
          <TrendingUp size={16} /> Live Metrics
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Total Users</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.total_users}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        {/* Total Active Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Active Users</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.total_active_users}</h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={24} />
          </div>
        </div>

        {/* Total Halls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Total Halls</p>
            <h3 className="text-3xl font-extrabold text-gray-900">{stats.total_halls}</h3>
          </div>
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
            <Building size={24} />
          </div>
        </div>

        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-400">Total Earnings</p>
            <h3 className="text-3xl font-extrabold text-gray-900">${stats.total_earnings?.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* SVG Booking Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 xl:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} /> Yearly Booking Trend
            </h3>
            <span className="text-xs font-semibold text-gray-400">{new Date().getFullYear()} Statistics</span>
          </div>
          
          <div className="h-72 w-full pt-4">
            {/* Custom SVG Column Chart */}
            <svg viewBox="0 0 600 240" className="w-full h-full">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="200" x2="580" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Bars */}
              {(stats.yearly_booking_trend || []).map((data, i) => {
                const barWidth = 26;
                const spacing = 44;
                const x = 55 + i * spacing;
                // Scale bar height: max height of SVG area is 180 (from 20 to 200)
                const height = (data.bookings / maxBookingsVal) * 160;
                const y = 200 - height;
                
                return (
                  <g key={data.month} className="group cursor-pointer">
                    {/* Tooltip background & text */}
                    <rect 
                      x={x - 8} 
                      y={y - 25} 
                      width="42" 
                      height="20" 
                      rx="4" 
                      fill="#1e293b" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                    />
                    <text 
                      x={x + 13} 
                      y={y - 11} 
                      fill="white" 
                      fontSize="10" 
                      fontWeight="bold" 
                      textAnchor="middle" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {data.bookings}
                    </text>
                    
                    {/* Visual Bar with Gradient Fill */}
                    <defs>
                      <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="4"
                      fill={`url(#gradient-${i})`}
                      className="transition-all duration-300 group-hover:fill-blue-500"
                    />
                    {/* Axis Labels */}
                    <text
                      x={x + barWidth / 2}
                      y="218"
                      fill="#64748b"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {data.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Distributions Side Panels */}
        <div className="space-y-8">
          {/* Booking Status Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <PieChart className="text-blue-600" size={20} /> Booking Status
            </h3>
            
            <div className="space-y-4 pt-2">
              {Object.entries(stats.booking_status_distribution || {}).map(([status, count]) => {
                const percentage = bookingStatusTotal > 0 ? ((count / bookingStatusTotal) * 100).toFixed(0) : 0;
                
                let barColor = 'bg-blue-600';
                let textColor = 'text-blue-700';
                let pillColor = 'bg-blue-50';
                
                if (status === 'pending') {
                  barColor = 'bg-amber-500';
                  textColor = 'text-amber-700';
                  pillColor = 'bg-amber-50';
                } else if (status === 'rejected') {
                  barColor = 'bg-red-500';
                  textColor = 'text-red-700';
                  pillColor = 'bg-red-50';
                } else if (status === 'paid') {
                  barColor = 'bg-emerald-500';
                  textColor = 'text-emerald-700';
                  pillColor = 'bg-emerald-50';
                }

                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                        {status}
                      </span>
                      <span className="text-gray-700 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hall Status Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-4">
              <Building className="text-blue-600" size={20} /> Hall Availability
            </h3>
            
            <div className="space-y-4 pt-2">
              {Object.entries(stats.hall_status_distribution || {}).map(([status, count]) => {
                const percentage = hallStatusTotal > 0 ? ((count / hallStatusTotal) * 100).toFixed(0) : 0;
                
                const isAvailable = status.toLowerCase() === 'available';
                const barColor = isAvailable ? 'bg-emerald-500' : 'bg-rose-500';
                
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                        {status}
                      </span>
                      <span className="text-gray-700 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;
