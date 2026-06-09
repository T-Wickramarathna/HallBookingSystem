import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Briefcase } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-32"></div>
      <div className="px-8 pb-8 relative">
        <div className="flex items-end -mt-12 mb-6">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
            <div className="w-full h-full bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {user.first_name?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="ml-6 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{user.first_name} {user.last_name}</h1>
            <p className="text-gray-500 font-medium">{user.designation || 'User'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
            
            <div className="flex items-center text-gray-700">
              <Mail className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Phone className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Mobile Number</p>
                <p className="font-medium">{user.mobile_number || 'Not provided'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Account Details</h3>
            
            <div className="flex items-center text-gray-700">
              <Briefcase className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium">{user.designation || 'Standard User'}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-700">
              <User className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="font-medium text-emerald-600">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
