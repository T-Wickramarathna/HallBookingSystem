import React, { useState, useEffect } from 'react';
import { Loader2, Receipt, CreditCard, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import StripePaymentModal from '../components/StripePaymentModal';
import html2pdf from 'html2pdf.js';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingBooking, setPayingBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/my-bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Could not retrieve bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDownloadInvoice = (booking) => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="color: #2563eb; font-size: 28px; margin: 0; font-weight: bold;">HallBooker</h1>
            <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Event Spaces Reservation Receipt</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px; color: #333;">INVOICE</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 2px 0 0 0; font-size: 14px; color: #666;">Booking ID: #${booking.id}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px; display: flex; justify-content: space-between;">
          <div>
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2563eb;">Billed To:</h3>
            <p style="margin: 0; font-weight: bold;">${booking.user?.first_name || ''} ${booking.user?.last_name || ''}</p>
            <p style="margin: 5px 0 0 0;">Email: ${booking.user?.email || ''}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2563eb;">Payment Status:</h3>
            <p style="margin: 0;">Status: <strong style="color: #10b981;">PAID</strong></p>
            <p style="margin: 5px 0 0 0;">Transaction Ref: ${booking.payment?.stripe_payment_id || 'Stripe API Session'}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #2563eb; color: white; text-align: left;">
              <th style="padding: 12px; font-size: 14px; border: 1px solid #ddd;">Description</th>
              <th style="padding: 12px; font-size: 14px; border: 1px solid #ddd; text-align: center;">Details</th>
              <th style="padding: 12px; font-size: 14px; border: 1px solid #ddd; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;">
                <strong style="color: #2563eb; font-size: 15px;">${booking.hall?.name || 'Hall Space'}</strong><br/>
                <span style="color: #666; font-size: 13px;">Location: ${booking.hall?.location || ''}</span>
              </td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; font-size: 13px; color: #555;">
                Date: ${booking.booking_date}<br/>
                Time: ${booking.start_time} - ${booking.end_time}<br/>
                Seats: ${booking.seats_booked}
              </td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
                $${booking.total_price}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="border-top: 2px solid #eee; padding-top: 20px; display: flex; justify-content: flex-end;">
          <div style="width: 250px; text-align: right;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
              <span>Subtotal:</span>
              <span>$${booking.total_price}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 1px solid #ddd; padding-top: 10px; color: #2563eb;">
              <span>Total Paid:</span>
              <span>$${booking.total_price}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          Thank you for booking with HallBooker! If you have any questions, please contact our support team.
        </div>
      </div>
    `;

    const opt = {
      margin:       10,
      filename:     `invoice_booking_${booking.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Pending Approval
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <p className="text-gray-500 mt-1">Monitor all your requests, make payments and retrieve receipts.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-blue-600">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="font-medium text-gray-500">Retrieving your bookings list...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-red-300 text-red-600">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h3 className="text-lg font-medium">Failed to load</h3>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchBookings} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <AlertCircle className="h-12 w-12 text-gray-350 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
          <p className="text-gray-550 text-sm mt-1">You haven't requested any space reservations yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-550 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-5">Booking ID</th>
                  <th className="p-5">Hall Name</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Time Frame</th>
                  <th className="p-5 text-center">Seats</th>
                  <th className="p-5 text-right">Price</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {bookings.map((booking) => {
                  const isAccepted = booking.status.toLowerCase() === 'accepted';
                  const isPaid = booking.status.toLowerCase() === 'paid';
                  
                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-semibold text-slate-900">#{booking.id}</td>
                      <td className="p-5">
                        <div>
                          <div className="font-semibold text-slate-900">{booking.hall?.name || 'Unavailable'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{booking.hall?.location}</div>
                        </div>
                      </td>
                      <td className="p-5 whitespace-nowrap">{booking.booking_date}</td>
                      <td className="p-5 whitespace-nowrap text-slate-500">
                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                      </td>
                      <td className="p-5 text-center">{booking.seats_booked}</td>
                      <td className="p-5 text-right font-bold text-slate-900">${booking.total_price}</td>
                      <td className="p-5">{getStatusBadge(booking.status)}</td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-2">
                          {isAccepted && (
                            <button
                              onClick={() => setPayingBooking(booking)}
                              className="inline-flex items-center gap-1 px-4 py-2 border border-transparent rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              <CreditCard size={14} /> Pay Now
                            </button>
                          )}
                          {isPaid && (
                            <button
                              onClick={() => handleDownloadInvoice(booking)}
                              className="inline-flex items-center gap-1 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                            >
                              <Receipt size={14} /> Invoice
                            </button>
                          )}
                          {!isAccepted && !isPaid && (
                            <button
                              disabled
                              className="inline-flex items-center gap-1 px-4 py-2 border border-slate-100 rounded-xl text-xs font-semibold text-slate-350 bg-slate-50 cursor-not-allowed"
                            >
                              No Action
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payingBooking && (
        <StripePaymentModal
          booking={payingBooking}
          onClose={() => setPayingBooking(null)}
          onSuccess={() => {
            setPayingBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
