import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on initialization
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data from localStorage");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Assuming your API endpoint is /login
      const response = await api.post('/login', credentials);
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      Swal.fire({
        position: 'top-right',
        toast: true,
        icon: 'success',
        title: 'Successfully logged in!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__slideInRight'
        },
        hideClass: {
          popup: 'animate__animated animate__slideOutRight'
        }
      });
      return true;
    } catch (error) {
      Swal.fire({
        position: 'top-right',
        toast: true,
        icon: 'error',
        title: error.response?.data?.message || 'Login failed. Please try again.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__slideInRight'
        },
        hideClass: {
          popup: 'animate__animated animate__slideOutRight'
        }
      });
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      const { token: newToken, user: newUserData } = response.data;
      
      setToken(newToken);
      setUser(newUserData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUserData));

      Swal.fire({
        position: 'top-right',
        toast: true,
        icon: 'success',
        title: 'Registration successful!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__slideInRight'
        },
        hideClass: {
          popup: 'animate__animated animate__slideOutRight'
        }
      });
      return true;
    } catch (error) {
      Swal.fire({
        position: 'top-right',
        toast: true,
        icon: 'error',
        title: error.response?.data?.message || 'Registration failed. Please check your inputs.',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__slideInRight'
        },
        hideClass: {
          popup: 'animate__animated animate__slideOutRight'
        }
      });
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    Swal.fire({
      position: 'top-right',
      toast: true,
      icon: 'info',
      title: 'Logged out successfully',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__slideInRight'
      },
      hideClass: {
        popup: 'animate__animated animate__slideOutRight'
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
