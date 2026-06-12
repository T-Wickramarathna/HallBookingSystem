import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import HallCard from '../components/HallCard';
import BookingModal from '../components/BookingModal';
import api from '../services/api';

const HallsListing = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHall, setSelectedHall] = useState(null);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const response = await api.get('/halls');
        setHalls(response.data);
      } catch (err) {
        console.error('Failed to fetch halls:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  // Filter and Sort logic
  const filteredHalls = halls
    .filter(hall => hall.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'capacity-asc') return a.capacity - b.capacity;
      if (sortBy === 'capacity-desc') return b.capacity - a.capacity;
      return a.name.localeCompare(b.name);
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredHalls.length / itemsPerPage);
  const paginatedHalls = filteredHalls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBookNow = (id) => {
    const hall = halls.find(h => h.id === id);
    if (hall) {
      setSelectedHall(hall);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-blue-50">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Explore Halls</h2>
          <p className="text-gray-500 mt-1">Find and book the perfect space for your event.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search halls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white appearance-none text-gray-700 font-medium"
            >
              <option value="name">Sort by Name</option>
              <option value="capacity-asc">Capacity (Low to High)</option>
              <option value="capacity-desc">Capacity (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-blue-600">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p className="font-medium text-gray-500">Loading available spaces...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedHalls.length > 0 ? (
              paginatedHalls.map((hall) => (
                <HallCard key={hall.id} hall={hall} onBookNow={handleBookNow} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No halls found</h3>
                <p className="text-gray-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {selectedHall && (
        <BookingModal 
          hall={selectedHall} 
          onClose={() => setSelectedHall(null)} 
        />
      )}
    </div>
  );
};

export default HallsListing;
