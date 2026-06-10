import React, { useState, useEffect } from 'react';
import { Loader2, Download, CreditCard, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import StripePaymentModal from '../components/StripePaymentModal';
import html2pdf from 'html2pdf.js';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const generateInvoice = (booking) => {
    const invoiceContent = `
      <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="color: #2563eb; margin: 0; font-size: 28px;">HallBooker</h1>
            <p style="margin: 5px 0 0; color: #6b7280;">Premium Event Spaces</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 24px; color: #1f2937;">INVOICE</h2>
            <p style="margin: 5px 0 0; color: #6b7280;">#HB-${booking.id.toString().padStart(5, '0')}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div>
            <h3 style="margin: 0 0 10px; color: #4b5563;">Billed To:</h3>
            <p style="margin: 0; font-weight: bold;">${booking.user?.first_name} ${booking.user?.last_name}</p>
            <p style="margin: 5px 0 0;">${booking.user?.email}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0 0 10px; color: #4b5563;">Booking Details:</h3>
            <p style="margin: 0;"><strong>Date:</strong> ${booking.booking_date}</p>
            <p style="margin: 5px 0 0;"><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">Description</th>
              <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">Seats</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 15px 12px; border-bottom: 1px solid #e5e7eb;">
                <strong>${booking.hall?.name}</strong><br/>
                <span style="font-size: 14px; color: #6b7280;">${booking.hall?.location}</span>
              </td>
              <td style="padding: 15px 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${booking.seats_booked}</td>
              <td style="padding: 15px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: bold;">$${booking.total_price}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #e5e7eb;">
              <span style="font-weight: bold; font-size: 18px;">Total Paid:</span>
              <span style="font-weight: bold; font-size: 18px; color: #2563eb;">$${booking.total_price}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 60px; text-align: center; color: #9ca3af; font-size: 14px;">
          <p>Thank you for choosing HallBooker for your event!</p>
        </div>
      </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = invoiceContent;

    const opt = {
      margin: 0,
      filename: `Invoice-HB-${booking.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        logging: false,
        ignoreElements: (node) => {
          return node.nodeName === 'STYLE' || node.nodeName === 'LINK';
        }
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Paid</span>;
      case 'accepted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Payment Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-blue-600">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <p className="text-gray-500 mt-1">Manage your reservations and payments.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Hall</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date & Time</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Seats</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Total Price</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{booking.hall?.name}</div>
                      <div className="text-sm text-gray-500">{booking.hall?.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{booking.booking_date}</div>
                      <div className="text-sm text-gray-500">{booking.start_time} - {booking.end_time}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{booking.seats_booked}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${booking.total_price}</td>
                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-4">
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => setSelectedBookingForPayment(booking)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CreditCard className="w-4 h-4 mr-1.5" />
                          Pay Now
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-400 bg-gray-100 cursor-not-allowed"
                        >
                          <CreditCard className="w-4 h-4 mr-1.5" />
                          Pay Now
                        </button>
                      )}
                      {booking.status === 'paid' && (
                        <button
                          onClick={() => generateInvoice(booking)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Download className="w-4 h-4 mr-1.5 text-blue-600" />
                          Invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't made any bookings yet.
          </div>
        )}
      </div>

      {selectedBookingForPayment && (
        <StripePaymentModal
          booking={selectedBookingForPayment}
          onClose={() => setSelectedBookingForPayment(null)}
          onSuccess={() => {
            setSelectedBookingForPayment(null);
            fetchBookings(); // refresh list
          }}
        />
      )}
    </div>
  );
};

export default MyBookings;
