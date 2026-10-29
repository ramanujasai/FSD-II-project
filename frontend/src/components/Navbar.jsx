import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-[#12121c] border-b border-[#232336] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 text-sm">
          {/* Left Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`transition hover:text-white ${
                isActive('/') ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Home
            </Link>

            <Link
              to="/schemes"
              className={`transition hover:text-white ${
                isActive('/schemes') ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Schemes
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`transition hover:text-white ${
                  isActive('/dashboard') ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                My Applications
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`transition hover:text-purple-300 ${
                  isActive('/admin') ? 'text-purple-400 font-semibold' : 'text-slate-400'
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-4 text-xs">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  {user?.name?.toLowerCase() || 'user'}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white hover:underline transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-slate-300 hover:text-white transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
