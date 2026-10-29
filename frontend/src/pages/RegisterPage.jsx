import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    state: 'State',
    district: 'District',
    pincode: '',
    occupation: 'Citizen',
    socialCategory: 'General'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0e0e14] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#161622] border border-[#26263a] rounded-xl p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white text-center mb-6">
          Register
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Full Name *
            </label>
            <input
              type="text"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Email *
            </label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Password *
            </label>
            <input
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Phone *
            </label>
            <input
              type="tel"
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="District"
                className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Social Category
              </label>
              <select
                name="socialCategory"
                value={formData.socialCategory}
                onChange={handleChange}
                aria-label="Social Category"
                className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Residential address"
              className="w-full px-3 py-2.5 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs transition shadow-sm"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          Already registered?{' '}
          <Link to="/login" className="text-purple-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
