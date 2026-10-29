import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-[#101018] border-t border-[#1e1e2d] text-slate-500 text-xs py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Government Scheme Beneficiary Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};
