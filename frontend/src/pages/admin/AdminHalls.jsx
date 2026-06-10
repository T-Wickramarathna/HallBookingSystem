import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Loader2, Home, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';

const AdminHalls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    price: '',
    description: '',
    status: 'available',
    image: null
  });

  const fetchHalls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/halls');
      setHalls(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to fetch halls", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleEdit = (hall) => {
    setEditId(hall.id);
    setFormData({
      name: hall.name,
      location: hall.location,
      capacity: hall.capacity,
      price: hall.price,
      description: hall.description || '',
      status: hall.status,
      image: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a', // slate-900
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/halls/${id}`);
        Swal.fire('Deleted!', 'The hall has been deleted.', 'success');
        fetchHalls();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete the hall.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (editId) {
        data.append('_method', 'PUT');
        await api.post(`/admin/halls/${editId}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        Swal.fire({
          icon: 'success',
          title: 'Hall Updated!',
          text: 'The hall has been successfully updated.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await api.post('/admin/halls', data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        Swal.fire({
          icon: 'success',
          title: 'Hall Created!',
          text: 'The new hall has been successfully added.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setIsModalOpen(false);
      setEditId(null);
      setFormData({
        name: '', location: '', capacity: '', price: '', description: '', status: 'available', image: null
      });
      fetchHalls();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to process request.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hall Management</h1>
          <p className="text-gray-500 mt-1">Add, update or remove event spaces globally</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({
              name: '', location: '', capacity: '', price: '', description: '', status: 'available', image: null
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add New Hall
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-slate-900 h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((hall) => (
            <div key={hall.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 relative">
                {hall.image_url ? (
                  <img src={hall.image_url} alt={hall.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    <ImageIcon size={48} />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <button onClick={() => handleEdit(hall)} className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-blue-600 hover:text-blue-700 transition-colors shadow-sm">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(hall.id)} className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-600 hover:text-red-700 transition-colors shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                  ${hall.price}/day
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{hall.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${hall.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {hall.status === 'available' ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{hall.location}</p>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hall.description || "No description provided."}</p>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span>Capacity</span>
                  <span className="text-gray-900">{hall.capacity} people</span>
                </div>
              </div>
            </div>
          ))}
          {halls.length === 0 && (
            <div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Home className="text-gray-400 h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No halls found</h3>
              <p className="text-gray-500">Get started by adding a new hall to your system.</p>
            </div>
          )}
          
          {Math.ceil(halls.length / itemsPerPage) > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 col-span-full">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium text-slate-900"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {currentPage} of {Math.ceil(halls.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(halls.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(halls.length / itemsPerPage)}
                className="px-4 py-2 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium text-slate-900"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Hall Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
              <h2 className="text-2xl font-bold text-gray-900">{editId ? 'Edit Hall' : 'Add New Hall'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hall Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (people)</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day ($)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white appearance-none"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hall Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-900 hover:text-slate-700 focus-within:outline-none px-1">
                        <span>Upload a file</span>
                        <input id="file-upload" name="image" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    {formData.image && (
                      <p className="text-sm font-semibold text-slate-900 mt-2">
                        Selected: {formData.image.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting && <Loader2 className="animate-spin h-5 w-5" />}
                  {isSubmitting ? 'Saving...' : 'Save Hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHalls;
