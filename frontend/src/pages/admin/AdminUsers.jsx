import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, CheckCircle2, XCircle, ShieldCheck, User as UserIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    mobile: ''
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      Swal.fire('Error', 'Failed to load users list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    // Optimistic UI update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    
    try {
      await api.patch(`/admin/users/${user.id}/toggle-status`);
    } catch (error) {
      // Revert if API fails
      setUsers(previousUsers);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: 'Failed to update user status.',
        toast: true,
        position: 'top-right',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitManager = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/managers', formData);
      Swal.fire({
        icon: 'success',
        title: 'Manager Invited',
        text: response.data.message || 'New manager account created successfully.',
        timer: 2000,
        showConfirmButton: false
      });
      // Add to local state dynamically
      setUsers([...users, response.data.user]);
      setIsModalOpen(false);
      setFormData({
        first_name: '', last_name: '', email: '', password: '', mobile: ''
      });
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to create manager.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system accounts and roles</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <ShieldCheck size={20} />
          Invite Manager
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {user.first_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                          ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            user.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 
                            'bg-gray-100 text-gray-700'}`
                        }>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <CheckCircle2 size={16} /> Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 text-sm font-medium">
                          <XCircle size={16} /> Inactive
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${user.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p>No users found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Invite New Manager</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitManager} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  required
                  pattern="^0[7][0-9]{8}$"
                  title="Format: 07XXXXXXXX"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="07XXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="animate-spin h-4 w-4" />}
                  {isSubmitting ? 'Inviting...' : 'Invite Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
