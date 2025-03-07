import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, LogOut } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

const Navbar = () => {
  const projectName = import.meta.env.VITE_PROJECT_NAME;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layout className="h-6 w-6" />
          <span className="text-xl font-bold">{projectName}</span>
        </div>
        <div className="flex items-center space-x-6">
          <NavLink
            to="/product-widget"
            className={({ isActive }) =>
              `hover:text-gray-300 ${isActive ? 'text-blue-400' : ''}`
            }
          >
            Product Widget
          </NavLink>
          <NavLink
            to="/brand-widget"
            className={({ isActive }) =>
              `hover:text-gray-300 ${isActive ? 'text-blue-400' : ''}`
            }
          >
            Brand Widget
          </NavLink>
          <NavLink
            to="/brand-map"
            className={({ isActive }) =>
              `hover:text-gray-300 ${isActive ? 'text-blue-400' : ''}`
            }
          >
            Map
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 hover:text-gray-300"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;