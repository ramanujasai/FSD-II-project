import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectPath = new URLSearchParams(location.search).get('redirect') || location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (redirectPath) {
          navigate(redirectPath);
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0e0e14] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm bg-[#161622] border border-[#26263a] rounded-xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white text-center mb-6">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs transition shadow-sm"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:underline">
            Register here
          </Link>
        </p>


      </div>
    </div>
  );
};
