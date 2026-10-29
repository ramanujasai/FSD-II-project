import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#0e0e14] text-white flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-[#161622] p-8 rounded-xl border border-[#232336] shadow-xl">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-white">404</h1>
        <h2 className="text-base font-bold text-zinc-200 mt-1">Page Not Found</h2>
        <p className="text-xs text-zinc-400 mt-2">
          The requested page or scheme record does not exist on this portal.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold text-xs shadow-md transition"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
