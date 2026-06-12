import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

const ManagerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/manager/bookings');
      setBookings(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // Optimistic UI update could be placed here, but let's wait for API confirmation
      await api.patch(`/manager/bookings/${id}/status`, { status: newStatus });
      
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Booking has been ${newStatus}.`,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      
      fetchBookings();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Could not update booking status.',
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Paid</span>;
      case 'accepted':
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Accepted</span>;
      case 'rejected':
      case 'declined':
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold">Rejected</span>;
      case 'pending':
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Booking Requests</h1>
          <p className="text-gray-500 mt-1">Review and manage user hall bookings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">#{booking.id}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.user?.first_name} {booking.user?.last_name}</div>
                      <div className="text-sm text-gray-500">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{booking.hall?.name || `Hall #${booking.hall_id}`}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span>{booking.start_date}</span>
                        <span className="text-gray-400 text-xs">to</span>
                        <span>{booking.end_date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                        disabled={booking.status === 'accepted' || booking.status === 'approved' || booking.status === 'paid'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                      >
                        <CheckCircle2 size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                        disabled={booking.status === 'rejected' || booking.status === 'declined' || booking.status === 'paid'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="text-gray-400 h-8 w-8" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">No bookings found</p>
                        <p className="text-sm mt-1">There are currently no hall booking requests.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerBookings;
