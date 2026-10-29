import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { schemeApi } from '../api/schemeApi';
import { applicationApi } from '../api/applicationApi';
import { useAuth } from '../context/AuthContext';

export const SchemeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Application form fields (directly on page like Screen 5 of reference PDF)
  const [submitting, setSubmitting] = useState(false);
  const [appError, setAppError] = useState('');
  const [appSuccess, setAppSuccess] = useState(null);
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(30);
  const [district, setDistrict] = useState(user?.district || 'District');
  const [annualIncome, setAnnualIncome] = useState(180000);
  const [socialCategory, setSocialCategory] = useState(user?.socialCategory || 'General');
  const [address, setAddress] = useState(user?.address || 'Main Road');
  const [purpose, setPurpose] = useState('Grant utilization for scheme assistance');

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const res = await schemeApi.getSchemeById(id);
        if (res.success) {
          setScheme(res.scheme);
        } else {
          setError('Scheme not found');
        }
      } catch (err) {
        setError(err.message || 'Error loading scheme');
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/schemes/${id}`);
      return;
    }

    setAppError('');
    setSubmitting(true);

    try {
      const payload = {
        schemeId: id,
        applicantDetails: {
          fullName,
          phone,
          age: Number(age),
          gender: 'Male',
          address,
          district,
          state: 'State',
          pincode: '520007',
          socialCategory,
          annualIncome: Number(annualIncome),
          occupation: 'Citizen'
        },
        schemeSpecificData: {
          purposeOfAssistance: purpose,
          declarationAccepted: true
        },
        documents: (scheme?.requiredDocuments || []).map((doc) => ({
          documentName: doc.documentName,
          fileName: `${doc.documentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
          fileSize: '450 KB'
        }))
      };

      const res = await applicationApi.submitApplication(payload);
      if (res.success) {
        setAppSuccess(res.application);
      }
    } catch (err) {
      setAppError(err.data?.message || err.message || 'Application submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0e0e14] min-h-[90vh] py-16 text-center text-slate-500 text-xs">
        Loading...
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="bg-[#0e0e14] min-h-[90vh] py-16 text-center">
        <p className="text-white text-sm mb-3">{error || 'Scheme not found'}</p>
        <Link to="/schemes" className="text-purple-400 text-xs hover:underline">
          &larr; Back to Schemes
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e14] min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <Link
          to="/schemes"
          className="inline-block text-xs text-slate-400 hover:text-white mb-4"
        >
          &larr; Back to Schemes
        </Link>

        {/* Top Card (Matching Screen 5 of Reference PDF) */}
        <div className="bg-[#161622] border border-[#232336] rounded-xl p-6 mb-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-lg font-bold text-white leading-tight">
              {scheme.title}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              {scheme.isActive ? 'AVAILABLE' : 'CLOSED'}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-400">
            <p><span className="text-slate-500">Type:</span> {scheme.category}</p>
            <p><span className="text-slate-500">Registration:</span> <span className="font-mono text-slate-300">{scheme.code}</span></p>
            <p className="font-semibold text-white pt-1">
              Rate: {scheme.benefits?.amountOrValue}
            </p>
          </div>
        </div>

        {/* Success Confirmation Card (Matching Screen 6) */}
        {appSuccess ? (
          <div className="bg-[#161622] border border-[#232336] rounded-xl p-6 text-center">
            <div className="p-4 rounded-lg bg-emerald-950/50 border border-emerald-800/80 mb-4 text-xs text-emerald-400">
              <p className="font-bold text-sm">Application Created (Status: Submitted)</p>
              <p className="mt-1 font-mono text-slate-300">Application No: {appSuccess.applicationNumber}</p>
              <p className="text-slate-400 mt-1">Applicant: {appSuccess.applicantDetails?.fullName}</p>
            </div>

            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="flex-1 py-2 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-semibold text-center transition"
              >
                Go to My Applications
              </Link>
              <Link
                to="/schemes"
                className="py-2 px-4 rounded bg-[#1b1b2a] hover:bg-[#252538] text-slate-300 text-xs font-semibold text-center transition"
              >
                More Schemes
              </Link>
            </div>
          </div>
        ) : (
          /* Bottom Form Card: "Book this Scheme" / "Apply for Scheme" (Matching Screen 5) */
          <div className="bg-[#161622] border border-[#232336] rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-4">
              Apply for Scheme
            </h2>

            {appError && (
              <div className="mb-4 p-2.5 rounded bg-red-950/60 border border-red-800 text-xs text-red-200">
                {appError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Annual Income (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    aria-label="Category"
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Purpose / Need Statement *
                </label>
                <textarea
                  rows="2"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Estimated Benefit Summary (Matching Screen 5) */}
              <div className="p-3 rounded bg-[#1b1b2a] border border-[#26263a] text-xs">
                <span className="text-slate-400 block">Sanctioned Entitlement:</span>
                <span className="font-bold text-white text-sm block mt-0.5">{scheme.benefits?.amountOrValue}</span>
              </div>

              {isAdmin ? (
                <div className="p-2 text-center text-slate-400 text-xs bg-[#1b1b2a] rounded">
                  Admin Review Mode
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !scheme.isActive}
                  className="w-full mt-2 py-2.5 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Application'}
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
