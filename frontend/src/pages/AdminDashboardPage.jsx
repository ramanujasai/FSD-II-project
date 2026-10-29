import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { schemeApi } from '../api/schemeApi';
import { applicationApi } from '../api/applicationApi';
import { Modal } from '../components/Modal';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications', 'schemes', 'beneficiaries'
  const [stats, setStats] = useState(null);

  // Applications
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Schemes
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Agriculture & Farming');
  const [newRate, setNewRate] = useState('₹50,000 / grant');
  const [newCode, setNewCode] = useState(`SCH-GEN-${Math.floor(100 + Math.random() * 900)}`);
  const [addingScheme, setAddingScheme] = useState(false);

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loadingBen, setLoadingBen] = useState(false);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchStats = async () => {
    try {
      const res = await adminApi.getStats();
      if (res.success) setStats(res.stats);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApps = async () => {
    setLoadingApps(true);
    try {
      const res = await applicationApi.getApplications();
      if (res.success) setApplications(res.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchSchemes = async () => {
    setLoadingSchemes(true);
    try {
      const res = await schemeApi.getSchemes({ status: 'all' });
      if (res.success) setSchemes(res.schemes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSchemes(false);
    }
  };

  const fetchBeneficiaries = async () => {
    setLoadingBen(true);
    try {
      const res = await adminApi.getBeneficiaries();
      if (res.success) setBeneficiaries(res.beneficiaries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBen(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchApps();
  }, []);

  useEffect(() => {
    if (activeTab === 'schemes') fetchSchemes();
    if (activeTab === 'applications') fetchApps();
    if (activeTab === 'beneficiaries') fetchBeneficiaries();
  }, [activeTab]);

  const handleAddScheme = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAddingScheme(true);
    try {
      await schemeApi.createScheme({
        title: newTitle,
        code: newCode,
        category: newCategory,
        shortDescription: `Government assistance grant under ${newCategory}`,
        fullDescription: `Targeted financial assistance and subsidy scheme under ${newCategory}.`,
        sponsoringDepartment: 'Department of Public Welfare',
        benefits: {
          summary: newRate,
          amountOrValue: newRate,
          type: 'Direct Financial Subsidy'
        },
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      });
      setNewTitle('');
      setNewCode(`SCH-GEN-${Math.floor(100 + Math.random() * 900)}`);
      fetchSchemes();
      fetchStats();
    } catch (err) {
      alert(err.message || 'Error adding scheme');
    } finally {
      setAddingScheme(false);
    }
  };

  const handleToggleScheme = async (id) => {
    try {
      await schemeApi.toggleSchemeStatus(id);
      fetchSchemes();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenReview = (app) => {
    setCurrentApp(app);
    setErrorMsg('');
    setRemarks('');

    let def = '';
    if (app.status === 'Submitted') def = 'Under Review';
    if (app.status === 'Under Review') def = 'Approved';
    if (app.status === 'Approved') def = 'Disbursed';
    if (app.status === 'Rejected') def = 'Under Review';
    setTargetStatus(def);
    setReviewModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setUpdating(true);
    try {
      const res = await applicationApi.updateStatus(currentApp._id, {
        status: targetStatus,
        remarks: remarks || `Status changed to ${targetStatus}`
      });
      if (res.success) {
        setReviewModalOpen(false);
        fetchApps();
        fetchStats();
      }
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-[#0e0e14] min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8 text-xs">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">
          Admin Dashboard
        </h1>

        {/* Tab Pills (Matching Screen 8 & 9 of Reference PDF) */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded text-xs font-semibold transition ${
              activeTab === 'applications'
                ? 'bg-[#a855f7] text-white'
                : 'bg-[#1b1b2a] text-slate-400 hover:text-white'
            }`}
          >
            Applications ({stats?.totalApplications || applications.length})
          </button>

          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 rounded text-xs font-semibold transition ${
              activeTab === 'schemes'
                ? 'bg-[#a855f7] text-white'
                : 'bg-[#1b1b2a] text-slate-400 hover:text-white'
            }`}
          >
            Schemes ({stats?.totalSchemes || schemes.length})
          </button>

          <button
            onClick={() => setActiveTab('beneficiaries')}
            className={`px-4 py-2 rounded text-xs font-semibold transition ${
              activeTab === 'beneficiaries'
                ? 'bg-[#a855f7] text-white'
                : 'bg-[#1b1b2a] text-slate-400 hover:text-white'
            }`}
          >
            Beneficiaries ({beneficiaries.length})
          </button>
        </div>

        {/* TAB 1: APPLICATIONS (Screen 8 & 9) */}
        {activeTab === 'applications' && (
          <div className="bg-[#161622] border border-[#232336] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12121a] border-b border-[#232336] text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Scheme</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232336]">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-[#1a1a28] transition">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{app.applicantDetails?.fullName}</p>
                        <p className="text-[11px] text-slate-400">{app.applicantDetails?.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-slate-200">{app.scheme?.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{app.scheme?.code}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {app.scheme?.benefits?.amountOrValue}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          app.status === 'Approved' || app.status === 'Disbursed'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : app.status === 'Rejected'
                            ? 'bg-red-950/80 text-red-400 border border-red-800'
                            : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenReview(app)}
                          className="py-1 px-3 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-medium transition"
                        >
                          Review & Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEMES (Screen 8 Layout) */}
        {activeTab === 'schemes' && (
          <div className="space-y-6">
            {/* Add New Scheme Card (Matching Screen 8 of Reference PDF) */}
            <div className="bg-[#161622] border border-[#232336] rounded-xl p-5">
              <h2 className="text-sm font-bold text-white mb-3">
                Add New Scheme
              </h2>

              <form onSubmit={handleAddScheme} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Scheme Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    aria-label="Category"
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Agriculture & Farming">Agriculture & Farming</option>
                    <option value="Education & Skill">Education & Skill</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Housing & Sanitation">Housing & Sanitation</option>
                    <option value="Women & Child Development">Women & Child Development</option>
                    <option value="Senior Citizen & Social Security">Senior Citizen & Social Security</option>
                    <option value="Financial Inclusion & Microenterprise">Financial Inclusion & Microenterprise</option>
                  </select>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Rate / Entitlement (e.g. ₹50,000)"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={addingScheme}
                    className="w-full py-2 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs transition"
                  >
                    {addingScheme ? 'Adding...' : 'Add Scheme'}
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Schemes Table */}
            <div className="bg-[#161622] border border-[#232336] rounded-xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#12121a] border-b border-[#232336] text-slate-400 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Scheme Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Reg No</th>
                    <th className="py-3 px-4">Rate</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232336]">
                  {schemes.map((sc) => (
                    <tr key={sc._id} className="hover:bg-[#1a1a28] transition">
                      <td className="py-3.5 px-4 font-semibold text-white">{sc.title}</td>
                      <td className="py-3.5 px-4 text-slate-300">{sc.category}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{sc.code}</td>
                      <td className="py-3.5 px-4 text-white font-medium">{sc.benefits?.amountOrValue}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          sc.isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950/80 text-red-400 border border-red-800'
                        }`}>
                          {sc.isActive ? 'AVAILABLE' : 'CLOSED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleScheme(sc._id)}
                          className="py-1 px-3 rounded bg-[#1b1b2a] hover:bg-[#252538] text-slate-300 border border-[#2f2f47] text-xs transition"
                        >
                          {sc.isActive ? 'Close' : 'Reopen'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BENEFICIARIES */}
        {activeTab === 'beneficiaries' && (
          <div className="bg-[#161622] border border-[#232336] rounded-xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12121a] border-b border-[#232336] text-slate-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4">Scheme</th>
                  <th className="py-3 px-4">App No</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">DBT Ref</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232336]">
                {beneficiaries.map((b) => (
                  <tr key={b._id} className="hover:bg-[#1a1a28] transition">
                    <td className="py-3.5 px-4 font-semibold text-white">{b.applicantDetails?.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-300">{b.scheme?.title}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{b.applicationNumber}</td>
                    <td className="py-3.5 px-4 text-white font-medium">{b.scheme?.benefits?.amountOrValue}</td>
                    <td className="py-3.5 px-4 font-mono text-purple-400">{b.demoDisbursementReference || 'Pending'}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Modal */}
        {currentApp && (
          <Modal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            title={`Application Review: ${currentApp.applicationNumber}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 rounded bg-red-950/60 border border-red-800 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="p-3 rounded bg-[#1b1b2a] border border-[#26263a] text-slate-300 space-y-1">
                <p><span className="text-slate-500">Applicant:</span> <strong className="text-white">{currentApp.applicantDetails?.fullName}</strong></p>
                <p><span className="text-slate-500">Scheme:</span> {currentApp.scheme?.title}</p>
                <p><span className="text-slate-500">Current Status:</span> <strong className="text-purple-400">{currentApp.status}</strong></p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Update Status to:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  aria-label="Target Status"
                  className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500"
                >
                  {currentApp.status === 'Submitted' && (
                    <option value="Under Review">Under Review</option>
                  )}
                  {currentApp.status === 'Under Review' && (
                    <>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </>
                  )}
                  {currentApp.status === 'Approved' && (
                    <option value="Disbursed">Disbursed</option>
                  )}
                  {currentApp.status === 'Rejected' && (
                    <option value="Under Review">Under Review (Re-evaluate)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Remarks:
                </label>
                <textarea
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Decision remarks..."
                  className="w-full px-3 py-2 rounded bg-[#1b1b2a] border border-[#2f2f47] text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#232336]">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#1b1b2a] text-slate-300 hover:bg-[#252538]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 rounded bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold"
                >
                  {updating ? 'Updating...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};
