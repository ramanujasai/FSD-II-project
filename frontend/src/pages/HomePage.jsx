import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { schemeApi } from '../api/schemeApi';
import { Building2 } from 'lucide-react';

export const HomePage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await schemeApi.getSchemes({ status: 'active' });
        if (res.success && res.schemes) {
          setFeaturedSchemes(res.schemes.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-[#0e0e14] min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* User Hero Section (Matching Screen 3 of PDF) */}
        <div className="text-center py-10 my-4">
          <div className="w-16 h-16 rounded-full bg-[#1b1b2a] border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Building2 className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to Government Scheme Portal
          </h1>

          <p className="text-sm text-purple-400 font-medium mt-1">
            Hello, {isAuthenticated ? user?.name : 'Citizen'}!
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 text-xs">
            <Link
              to="/schemes"
              className="px-5 py-2.5 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold transition"
            >
              Browse Schemes
            </Link>

            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="px-5 py-2.5 rounded-lg bg-[#1a1a26] hover:bg-[#252538] border border-[#2f2f45] text-slate-300 font-semibold transition"
              >
                {isAdmin ? 'Admin Dashboard' : 'My Applications'}
              </Link>
            ) : (
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-[#1a1a26] hover:bg-[#252538] border border-[#2f2f45] text-slate-300 font-semibold transition"
              >
                Register
              </Link>
            )}
          </div>
        </div>

        {/* Featured Schemes Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Available Schemes</h2>
            <Link to="/schemes" className="text-xs text-purple-400 hover:underline">
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 text-xs py-8">Loading schemes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredSchemes.map((sc) => (
                <div
                  key={sc._id}
                  className="bg-[#161622] border border-[#232336] rounded-xl p-5 flex flex-col justify-between hover:border-[#383850] transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {sc.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        AVAILABLE
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400">
                      <p><span className="text-slate-500">Category:</span> {sc.category}</p>
                      <p><span className="text-slate-500">Code:</span> <span className="font-mono text-slate-300">{sc.code}</span></p>
                      <p className="font-semibold text-white pt-1">
                        {sc.benefits?.amountOrValue}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#232336] text-center">
                    <Link
                      to={`/schemes/${sc._id}`}
                      className="inline-block w-full py-1.5 rounded bg-[#1f1f2e] hover:bg-[#2a2a3d] border border-[#2e2e42] text-xs text-slate-200 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
