import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layout } from 'lucide-react';

const Navbar = () => {
  const projectName = import.meta.env.VITE_PROJECT_NAME;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layout className="h-6 w-6" />
          <span className="text-xl font-bold">{projectName}</span>
        </div>
        <div className="space-x-6">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;