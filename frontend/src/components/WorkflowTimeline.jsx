import React from 'react';
import { Check, Clock, AlertTriangle, XCircle, Award } from 'lucide-react';

export const WorkflowTimeline = ({ application }) => {
  if (!application) return null;

  const { status, statusHistory = [], adminRemarks, disbursedAt, demoDisbursementReference } = application;

  const isRejected = status === 'Rejected';

  const stages = [
    {
      id: 'Submitted',
      title: 'Application Submitted',
      description: 'Application successfully received in portal.'
    },
    {
      id: 'Under Review',
      title: 'Verification & Review',
      description: 'Department officer scrutinizes eligibility credentials.'
    },
    {
      id: isRejected ? 'Rejected' : 'Approved',
      title: isRejected ? 'Application Rejected' : 'Sanctioned / Approved',
      description: isRejected
        ? 'Did not meet specified criteria during audit.'
        : 'Eligible for scheme entitlements; sent to disbursement queue.'
    },
    {
      id: 'Disbursed',
      title: 'Benefit Disbursed',
      description: 'Entitlement credit or benefit voucher issued.'
    }
  ];

  const getStatusIndex = (st) => {
    switch (st) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'Approved': return 2;
      case 'Rejected': return 2;
      case 'Disbursed': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(status);

  // Helper to find history entry for a status
  const getHistoryForStatus = (stageId) => {
    return statusHistory.find((h) => h.status === stageId);
  };

  return (
    <div className="py-2">
      <div className="relative">
        <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-[#232336] -z-0">
          <div
            className={`h-full transition-all duration-500 ${
              isRejected ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{
              width: `${(Math.min(currentIndex, stages.length - 1) / (stages.length - 1)) * 100}%`
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIndex || (idx === currentIndex && status !== 'Under Review' && !isRejected);
            const isCurrent = idx === currentIndex;
            const historyItem = getHistoryForStatus(stage.id);

            let icon = <Clock className="w-4 h-4 text-zinc-500" />;
            let circleBg = 'bg-[#161622] border-2 border-[#2e2e42] text-zinc-500';

            if (stage.id === 'Rejected' && isRejected) {
              icon = <XCircle className="w-4 h-4 text-white" />;
              circleBg = 'bg-rose-600 border-2 border-rose-500 text-white shadow-md shadow-rose-950';
            } else if (isCurrent) {
              if (stage.id === 'Disbursed') {
                icon = <Award className="w-4 h-4 text-white" />;
                circleBg = 'bg-purple-600 border-2 border-purple-500 text-white shadow-md shadow-purple-950';
              } else {
                icon = <Clock className="w-4 h-4 text-white animate-pulse" />;
                circleBg = 'bg-amber-600 border-2 border-amber-500 text-white shadow-md shadow-amber-950';
              }
            } else if (isCompleted || (idx <= currentIndex && !isRejected)) {
              icon = <Check className="w-4 h-4 text-white" />;
              circleBg = 'bg-emerald-600 border-2 border-emerald-500 text-white shadow-sm';
            }

            return (
              <div key={stage.id} className="flex flex-col sm:items-center text-left sm:text-center p-3 rounded-lg bg-[#161622] sm:bg-transparent border sm:border-0 border-[#232336]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 font-bold ${circleBg}`}>
                  {icon}
                </div>
                <h4 className="text-xs font-semibold text-white">{stage.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{stage.description}</p>

                {historyItem && (
                  <span className="text-[10px] font-medium text-zinc-400 mt-2 bg-[#232336] px-2 py-0.5 rounded">
                    {new Date(historyItem.changedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Remarks or Milestone details callout */}
      {(adminRemarks || demoDisbursementReference) && (
        <div className={`mt-5 p-3.5 rounded-lg border text-xs ${
          isRejected
            ? 'bg-[#28131a] border-rose-500/30 text-rose-200'
            : status === 'Disbursed'
            ? 'bg-[#241335] border-purple-500/30 text-purple-200'
            : 'bg-[#131d33] border-blue-500/30 text-blue-200'
        }`}>
          <div className="flex items-start gap-2.5">
            {isRejected ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            ) : status === 'Disbursed' ? (
              <Award className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-white">
                {isRejected
                  ? 'Rejection Remarks:'
                  : status === 'Disbursed'
                  ? 'Disbursement Reference:'
                  : 'Decision Remarks:'}
              </p>
              {adminRemarks && <p className="mt-1 text-zinc-300 text-xs">{adminRemarks}</p>}
              {demoDisbursementReference && (
                <div className="mt-2 font-mono text-xs inline-block bg-[#161622] border border-purple-500/40 text-purple-300 font-bold px-3 py-1 rounded">
                  DBT Ref: {demoDisbursementReference}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
