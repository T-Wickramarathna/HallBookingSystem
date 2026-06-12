import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, CalendarCheck, Home } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const ManagerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeHalls: 0,
    totalRevenue: '$0',
    bookingsPerMonth: [],
    hallOccupancy: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Attempt to fetch real data
        const response = await api.get('/manager/dashboard');
        const data = response.data;
        
        const totalBookings = Object.values(data.booking_status_distribution || {}).reduce((a, b) => a + b, 0);
        
        const bookingsPerMonth = (data.yearly_booking_trend || []).map(item => ({
          name: item.month,
          bookings: item.bookings
        }));

        const hallOccupancy = Object.entries(data.hall_status_distribution || {}).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }));

        setStats({
          totalBookings,
          activeHalls: data.hall_status_distribution?.available || 0,
          totalRevenue: `$${Number(data.total_earnings || 0).toLocaleString()}`,
          bookingsPerMonth,
          hallOccupancy
        });
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics Overview</h1>
          <p className="text-gray-500 mt-1">Monitor your hall bookings and system performance</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Bookings</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalBookings}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Home size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Halls</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeHalls}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Revenue (Est.)</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalRevenue}</h3>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Total Bookings per Month</h2>
          <div className="h-80 flex items-center justify-center">
            {stats.bookingsPerMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bookingsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="bookings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 italic">No data added yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Hall Occupancy Rate</h2>
          <div className="h-80 flex items-center justify-center">
            {stats.hallOccupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.hallOccupancy}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.hallOccupancy.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 italic">No data added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerAnalytics;
