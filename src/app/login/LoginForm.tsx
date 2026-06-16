'use client';

import React, { useActionState, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/actions/auth';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

function LoginFormContent() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  
  // Read error parameter from URL redirecting from middleware
  const urlError = searchParams ? searchParams.get('error') : null;

  // Determine the display error message
  const getErrorMessage = () => {
    if (state?.error) return state.error;
    if (urlError === 'unauthorized') {
      return 'Unauthorized account. Access is restricted to the administrator.';
    }
    if (urlError === 'unauthenticated') {
      return 'Your session has expired. Please log in to continue.';
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <form action={formAction} className="space-y-6">
      {errorMessage && (
        <div 
          className="flex items-start gap-3 p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-400 text-sm animate-pulse"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <p id="error-message" className="leading-relaxed font-sans">{errorMessage}</p>
        </div>
      )}

      {/* Email Input Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono">
          Admin Email
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#f9ba1f] transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="admin@example.com"
            className="block w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#222222] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#f9ba1f] focus:ring-2 focus:ring-[#f9ba1f]/10 hover:border-[#333333] transition-all text-sm font-sans"
          />
        </div>
      </div>

      {/* Password Input Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#f9ba1f] transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="block w-full pl-10 pr-12 py-3 bg-[#141414] border border-[#222222] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#f9ba1f] focus:ring-2 focus:ring-[#f9ba1f]/10 hover:border-[#333333] transition-all text-sm font-sans"
          />
          <button
            type="button"
            id="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="login-btn"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#f9ba1f] hover:bg-[#e0a61b] active:bg-[#c99516] disabled:bg-[#f9ba1f]/50 disabled:cursor-not-allowed text-black font-semibold rounded-xl text-sm transition-all duration-200 transform active:scale-[0.98] shadow-lg shadow-[#f9ba1f]/10 hover:shadow-[#f9ba1f]/20 font-sans cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying identity...</span>
          </>
        ) : (
          <span>Sign In as Admin</span>
        )}
      </button>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#f9ba1f]" />
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Initializing Secure Portal...</span>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
