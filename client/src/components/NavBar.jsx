// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, BarChart2, List, Activity, PlusCircle, Power } from 'lucide-react';

const Navbar = ({onLogout}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Activity Types', path: '/activity-types', icon: <List className="w-5 h-5" /> },
    { name: 'Activities', path: '/activities', icon: <Activity className="w-5 h-5" /> },
    { name: 'Time Logs', path: '/time-logs', icon: <Clock className="w-5 h-5" /> },
    { name: 'Add Time Log', path: '/add-time-log', icon: <PlusCircle className="w-5 h-5" /> },
  ];
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-indigo-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title */}
          <div className="flex items-center">
            <Clock className="w-8 h-8" />
            <span className="ml-2 font-bold text-xl">TimeTracker</span>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-indigo-800 text-white'
                    : 'hover:bg-indigo-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <button onClick={onLogout} className='flex items-center px-3 py-2 rounded-md txt-sm font-medium hover:bg-indigo-700 cursor-pointer'>
                <span className='mr-2'><Power className='w-5 h-5'/></span>
                Logout
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-indigo-800 text-white'
                    : 'hover:bg-indigo-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 pb-2 border-t border-indigo-800">
              <div className="mt-3 px-2">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium bg-indigo-800 hover:bg-indigo-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;