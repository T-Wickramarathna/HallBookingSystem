import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 px-8 py-4 flex justify-between items-center rounded-2xl mx-4 mt-4 sticky top-4 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">
          Welcome, {user?.first_name || 'User'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="flex items-center gap-2 p-2 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
          title="Profile"
        >
          <User size={24} />
        </button>
        <div className="w-px h-6 bg-gray-200"></div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
