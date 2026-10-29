import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { schemeApi } from '../api/schemeApi';
import { applicationApi } from '../api/applicationApi';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const ApplicationFormPage = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successApp, setSuccessApp] = useState(null);

  const [applicantDetails, setApplicantDetails] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    age: 32,
    gender: 'Male',
    address: user?.address || '',
    state: user?.state || 'Telangana',
    district: user?.district || 'Hyderabad',
    pincode: user?.pincode || '',
    socialCategory: user?.socialCategory || 'General',
    annualIncome: 180000,
    occupation: user?.occupation || 'Farmer'
  });

  const [purposeOfAssistance, setPurposeOfAssistance] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [criteriaChecked, setCriteriaChecked] = useState({});
  const [documentsList, setDocumentsList] = useState([]);

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      try {
        const res = await schemeApi.getSchemeById(schemeId);
        if (res.success && res.scheme) {
          setScheme(res.scheme);
          const initialChecks = {};
          (res.scheme.eligibilityCriteria || []).forEach((c, idx) => {
            initialChecks[idx] = false;
          });
          setCriteriaChecked(initialChecks);

          const docs = (res.scheme.requiredDocuments || []).map((doc) => ({
            documentName: doc.documentName,
            documentType: 'PDF/Document',
            fileName: `${doc.documentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`,
            fileSize: '500 KB',
            isMockUploaded: true,
            uploadedAt: new Date().toISOString()
          }));
          setDocumentsList(docs);
        } else {
          setError('Scheme not found');
        }
      } catch (err) {
        setError(err.message || 'Error loading scheme');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemeDetails();
  }, [schemeId]);

  const handleApplicantChange = (e) => {
    const { name, value } = e.target;
    setApplicantDetails((prev) => ({
      ...prev,
      [name]: name === 'annualIncome' || name === 'age' ? Number(value) : value
    }));
  };

  const handleCriteriaToggle = (idx) => {
    setCriteriaChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!declarationAccepted) {
      setError('Please accept the declaration before submitting');
      return;
    }

    const eligibilityDeclarations = (scheme?.eligibilityCriteria || []).map((c, idx) => ({
      criterion: c.criterion,
      declaredEligible: !!criteriaChecked[idx]
    }));

    setSubmitting(true);

    try {
      const payload = {
        schemeId,
        applicantDetails,
        schemeSpecificData: {
          purposeOfAssistance,
          eligibilityDeclarations,
          declarationAccepted: true
        },
        documents: documentsList
      };

      const res = await applicationApi.submitApplication(payload);
      if (res.success) {
        setSuccessApp(res.application);
      }
    } catch (err) {
      setError(err.data?.message || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0e14] py-16 flex items-center justify-center">
        <p className="text-sm font-medium text-zinc-400">Loading application form...</p>
      </div>
    );
  }

  if (successApp) {
    return (
      <div className="min-h-screen bg-[#0e0e14] text-white py-12">
        <div className="max-w-lg mx-auto px-4 text-center bg-[#161622] p-8 rounded-xl border border-[#232336] shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-white">
            Application Submitted
          </h2>

          <p className="text-xs text-zinc-400 mt-1">
            Application has been submitted successfully for verification.
          </p>

          <div className="my-5 p-4 rounded-lg bg-[#12121a] border border-[#232336] text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Application Number:</span>
              <span className="font-mono font-bold text-white">{successApp.applicationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Applicant:</span>
              <span className="font-semibold text-zinc-200">{successApp.applicantDetails?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status:</span>
              <span className="font-bold text-emerald-400">{successApp.status}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/dashboard"
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs text-center transition"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/schemes"
              className="py-2.5 px-4 rounded-lg bg-[#232336] hover:bg-[#2e2e42] text-zinc-300 font-semibold text-xs text-center transition"
            >
              Schemes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e14] text-white min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={`/schemes/${schemeId}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scheme Details</span>
        </Link>

        <div className="bg-[#161622] rounded-xl border border-[#232336] p-5 mb-5">
          <span className="text-[11px] font-semibold bg-[#232336] text-purple-300 px-2 py-0.5 rounded">
            {scheme?.category} &bull; {scheme?.code}
          </span>
          <h1 className="text-base font-bold text-white mt-2">
            Application: {scheme?.title?.replace(' (Fictional Demo)', '')}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#2a1118] border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Applicant Details */}
          <div className="bg-[#161622] rounded-xl border border-[#232336] p-5">
            <h2 className="text-sm font-bold text-white mb-4 border-b border-[#232336] pb-2">
              1. Applicant Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={applicantDetails.fullName}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={applicantDetails.phone}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  name="age"
                  value={applicantDetails.age}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={applicantDetails.gender}
                  onChange={handleApplicantChange}
                  aria-label="Gender"
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Annual Income (₹) *
                </label>
                <input
                  type="number"
                  required
                  name="annualIncome"
                  value={applicantDetails.annualIncome}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Permanent Address *
              </label>
              <textarea
                rows="2"
                required
                name="address"
                value={applicantDetails.address}
                onChange={handleApplicantChange}
                className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  required
                  name="district"
                  value={applicantDetails.district}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  name="state"
                  value={applicantDetails.state}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  name="pincode"
                  value={applicantDetails.pincode}
                  onChange={handleApplicantChange}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Eligibility Check */}
          <div className="bg-[#161622] rounded-xl border border-[#232336] p-5">
            <h2 className="text-sm font-bold text-white mb-3 border-b border-[#232336] pb-2">
              2. Eligibility Confirmation
            </h2>

            <div className="space-y-2">
              {(scheme?.eligibilityCriteria || []).map((item, idx) => (
                <label key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#12121a] border border-[#232336] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!criteriaChecked[idx]}
                    onChange={() => handleCriteriaToggle(idx)}
                    className="w-4 h-4 text-[#a855f7] rounded border-[#2e2e42] mt-0.5 accent-[#a855f7]"
                  />
                  <span className="text-xs text-zinc-300 font-medium">{item.criterion}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 3: Purpose of Need */}
          <div className="bg-[#161622] rounded-xl border border-[#232336] p-5">
            <h2 className="text-sm font-bold text-white mb-3 border-b border-[#232336] pb-2">
              3. Purpose of Assistance
            </h2>
            <textarea
              rows="3"
              required
              value={purposeOfAssistance}
              onChange={(e) => setPurposeOfAssistance(e.target.value)}
              placeholder="State the purpose and intended use of assistance..."
              className="w-full px-3 py-2 rounded-lg bg-[#12121a] border border-[#2e2e42] text-white text-xs focus:outline-none focus:border-[#a855f7]"
            />
          </div>

          {/* Section 4: Document List */}
          <div className="bg-[#161622] rounded-xl border border-[#232336] p-5">
            <h2 className="text-sm font-bold text-white mb-3 border-b border-[#232336] pb-2">
              4. Attached Documents
            </h2>
            <div className="space-y-2">
              {documentsList.map((doc, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-[#232336] bg-[#12121a] flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{doc.documentName}</span>
                  <span className="text-emerald-400 font-semibold bg-[#102919] border border-emerald-500/30 px-2 py-0.5 rounded text-[11px]">
                    Attached
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-[#161622] rounded-xl border border-[#232336] p-5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                className="w-4 h-4 text-[#a855f7] rounded border-[#2e2e42] mt-0.5 accent-[#a855f7]"
              />
              <span className="text-xs text-zinc-300 font-medium">
                I hereby certify that the information provided in this application is accurate and true to the best of my knowledge.
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-2.5 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs transition"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
