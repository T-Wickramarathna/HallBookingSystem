import React from 'react';
import { MapPin, Users } from 'lucide-react';

const HallCard = ({ hall, onBookNow }) => {
  const isAvailable = hall.status && hall.status.toLowerCase() === 'available';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 bg-gray-200">
        {hall.image_url ? (
          <img src={hall.image_url} alt={hall.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-400">
            <span className="font-medium text-lg">No Image</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
            isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {hall.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{hall.name}</h3>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-500 text-sm">
            <MapPin size={16} className="mr-2 text-blue-500" />
            {hall.location}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Users size={16} className="mr-2 text-blue-500" />
            Capacity: <span className="font-medium text-gray-700 ml-1">{hall.capacity} Seats</span>
          </div>
        </div>
        
        <button
          onClick={() => onBookNow(hall.id)}
          disabled={!isAvailable}
          className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
            isAvailable 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default HallCard;
