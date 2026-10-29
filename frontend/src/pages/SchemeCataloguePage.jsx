import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { schemeApi } from '../api/schemeApi';
import { Search, X } from 'lucide-react';

export const SchemeCataloguePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const categories = [
    'All',
    'Agriculture & Farming',
    'Education & Skill',
    'Healthcare',
    'Housing & Sanitation',
    'Women & Child Development',
    'Senior Citizen & Social Security',
    'Financial Inclusion & Microenterprise'
  ];

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await schemeApi.getSchemes({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchTerm.trim() || undefined,
        status: 'all'
      });
      if (res.success) {
        setSchemes(res.schemes || []);
      }
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div className="bg-[#0e0e14] min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">
          Schemes
        </h1>

        {/* Search & Categories Bar */}
        <div className="bg-[#161622] border border-[#232336] rounded-xl p-4 mb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schemes by name or code..."
                className="w-full pl-9 pr-8 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500 text-xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs rounded transition"
            >
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#a855f7] text-white font-semibold'
                    : 'bg-[#1b1b2a] text-slate-400 hover:text-white hover:bg-[#252538]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid (Matching Screen 4 of Reference PDF) */}
        {loading ? (
          <div className="text-center text-slate-500 text-xs py-10">Loading schemes...</div>
        ) : schemes.length === 0 ? (
          <div className="bg-[#161622] border border-[#232336] rounded-xl p-8 text-center text-slate-400 text-xs">
            No schemes found matching the criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((scheme) => (
              <div
                key={scheme._id}
                className="bg-[#161622] border border-[#232336] rounded-xl p-5 flex flex-col justify-between hover:border-[#333348] transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      <Link to={`/schemes/${scheme._id}`} className="hover:text-purple-300">
                        {scheme.title}
                      </Link>
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      scheme.isActive
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950/80 text-red-400 border border-red-800'
                    }`}>
                      {scheme.isActive ? 'AVAILABLE' : 'CLOSED'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mb-2">
                    <p><span className="text-slate-500">Type:</span> {scheme.category}</p>
                    <p><span className="text-slate-500">Reg No:</span> <span className="font-mono text-slate-300">{scheme.code}</span></p>
                    <p className="font-semibold text-white pt-1">
                      {scheme.benefits?.amountOrValue}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#232336] text-center">
                  <Link
                    to={`/schemes/${scheme._id}`}
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
  );
};
