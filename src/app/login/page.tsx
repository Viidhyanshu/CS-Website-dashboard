import React from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Admin Login | IEEE CS Dashboard',
  description: 'Secure authentication portal for the IEEE Computer Society admin dashboard.',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Animations */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#f9ba1f]/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#f9ba1f]/3 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#f9ba1f] flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-[#f9ba1f]/10 mb-4 select-none">
            CS
          </div>
          <h2 className="text-xs text-gray-500 uppercase tracking-widest font-mono font-bold">IEEE CS Portal</h2>
        </div>

        {/* Login Panel Card */}
        <section className="bg-[#0c0c0c]/80 backdrop-blur-md border border-[#1f1f1f] p-8 sm:p-10 rounded-2xl shadow-2xl relative">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Login</h1>
            <p className="text-gray-500 text-xs mt-2 font-mono">
              Authorized access only. Session activity is monitored.
            </p>
          </div>

          <LoginForm />
        </section>

        {/* Portal Footer */}
        <div className="mt-8 text-center text-[10px] text-gray-600 font-mono">
          &copy; {new Date().getFullYear()} IEEE Computer Society. All rights reserved.
        </div>
      </div>
    </main>
  );
}
