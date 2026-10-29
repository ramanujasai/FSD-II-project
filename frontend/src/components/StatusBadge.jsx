import React from 'react';
import { Clock, Search, CheckCircle, XCircle, Award } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5'
  };

  switch (status) {
    case 'Submitted':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider bg-[#131d33] text-blue-400 border border-blue-500/30 ${sizeClasses[size]}`}>
          <Clock className="w-3 h-3 text-blue-400" />
          <span>Submitted</span>
        </span>
      );

    case 'Under Review':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider bg-[#281d10] text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}>
          <Search className="w-3 h-3 text-amber-400" />
          <span>Under Review</span>
        </span>
      );

    case 'Approved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider bg-[#102919] text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}>
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Approved</span>
        </span>
      );

    case 'Rejected':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider bg-[#2c131a] text-rose-400 border border-rose-500/30 ${sizeClasses[size]}`}>
          <XCircle className="w-3 h-3 text-rose-400" />
          <span>Rejected</span>
        </span>
      );

    case 'Disbursed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider bg-[#241335] text-purple-300 border border-purple-500/30 ${sizeClasses[size]}`}>
          <Award className="w-3 h-3 text-purple-400" />
          <span>Disbursed</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider bg-[#1c1c28] text-zinc-300 border border-[#2e2e42] ${sizeClasses[size]}`}>
          <span>{status || 'Unknown'}</span>
        </span>
      );
  }
};
