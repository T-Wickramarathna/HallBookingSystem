import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

const BookingModal = ({ hall, onClose }) => {
  const [formData, setFormData] = useState({
    booking_date: '',
    start_time: '',
    end_time: '',
    seats_booked: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.booking_date);
    
    if (selectedDate < today) {
      setError('Booking date cannot be in the past.');
      setIsSubmitting(false);
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setError('Start time must be before end time.');
      setIsSubmitting(false);
      return;
    }
    
    if (parseInt(formData.seats_booked) > hall.capacity) {
      setError(`Number of seats cannot exceed hall capacity (${hall.capacity}).`);
      setIsSubmitting(false);
      return;
    }

    const startDateTime = new Date(`${formData.booking_date}T${formData.start_time}`);
    if (startDateTime <= new Date()) {
       setError('Selected time must be in the future.');
       setIsSubmitting(false);
       return;
    }

    try {
      await api.post('/bookings', {
        hall_id: hall.id,
        ...formData
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Booking Requested!',
        text: 'Your booking request is pending manager approval.',
        confirmButtonColor: '#2563eb'
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Book {hall.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              name="booking_date"
              required
              value={formData.booking_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time" 
                name="start_time"
                required
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                name="end_time"
                required
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
            <input 
              type="number" 
              name="seats_booked"
              required
              min="1"
              max={hall.capacity}
              value={formData.seats_booked}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Max capacity: {hall.capacity}</p>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Submitting...</>
              ) : (
                'Submit Booking Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
