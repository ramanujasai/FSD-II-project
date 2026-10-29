import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../api/applicationApi';
import { useAuth } from '../context/AuthContext';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { Modal } from '../components/Modal';

export const BeneficiaryDashboardPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await applicationApi.getApplications();
        if (res.success) {
          setApplications(res.applications || []);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleOpenDetail = (app) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-[#0e0e14] min-h-[90vh] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">
            My Applications
          </h1>
          <Link
            to="/schemes"
            className="text-xs text-purple-400 hover:underline"
          >
            + Apply for Scheme
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 text-xs py-10">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="bg-[#161622] border border-[#232336] rounded-xl p-8 text-center text-slate-400 text-xs">
            No applications submitted yet.
            <div className="mt-3">
              <Link to="/schemes" className="text-purple-400 hover:underline font-semibold">
                Browse Schemes &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-[#161622] border border-[#232336] rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-white">
                    {app.scheme?.title}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    app.status === 'Approved' || app.status === 'Disbursed'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : app.status === 'Rejected'
                      ? 'bg-red-950/80 text-red-400 border border-red-800'
                      : 'bg-blue-950/80 text-blue-400 border border-blue-800'
                  }`}>
                    {app.status === 'Approved' ? 'CONFIRMED' : app.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400 mb-4">
                  <p><span className="text-slate-500">App No:</span> <span className="font-mono text-slate-300">{app.applicationNumber}</span></p>
                  <p><span className="text-slate-500">Date:</span> {new Date(app.createdAt).toLocaleDateString()}</p>
                  <p><span className="text-slate-500">District:</span> {app.applicantDetails?.district}</p>
                  <p className="font-semibold text-white pt-1">
                    Rate: {app.scheme?.benefits?.amountOrValue}
                  </p>
                  {app.adminRemarks && (
                    <p className="text-[11px] text-slate-400 pt-1 italic">
                      Remarks: {app.adminRemarks}
                    </p>
                  )}
                  {app.demoDisbursementReference && (
                    <p className="text-[11px] text-purple-400 font-mono font-semibold pt-1">
                      DBT Reference: {app.demoDisbursementReference}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-[#232336]">
                  <button
                    onClick={() => handleOpenDetail(app)}
                    className="flex-1 py-1.5 rounded bg-[#1f1f2e] hover:bg-[#28283c] border border-[#2e2e42] text-xs text-slate-200 transition"
                  >
                    View Status Timeline
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-3 rounded bg-[#1b1b26] hover:bg-[#252538] border border-[#28283a] text-xs text-slate-400 transition"
                  >
                    Print Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Timeline Modal */}
        {selectedApp && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Application Details - ${selectedApp.applicationNumber}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3 rounded bg-[#1b1b2a] border border-[#2f2f47]">
                <p className="font-bold text-white text-sm">{selectedApp.scheme?.title}</p>
                <p className="text-slate-400 mt-1">Status: <strong className="text-purple-400">{selectedApp.status}</strong></p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 mb-2">Workflow Progression</h4>
                <WorkflowTimeline application={selectedApp} />
              </div>

              <div className="flex justify-end pt-3 border-t border-[#232336]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded bg-[#252538] hover:bg-[#2f2f47] text-white text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
