import React, { useState } from 'react';
import { Mail, Key, ShieldCheck, Loader2, ArrowRight, Building } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
  onNavigateToRegister: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToRegister }: LoginProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailOrUsername.trim() || !password) {
      setError('Please provide your login credentials.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials or login failed.');
      }

      if (rememberMe) {
        localStorage.setItem('propspace_remember', 'true');
      } else {
        localStorage.removeItem('propspace_remember');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmailOrUsername('john@example.com');
    setPassword('Password123!');
    setRememberMe(true);
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-12" id="login-view">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md">
        {/* Brand Signpost */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-blue-200 mb-3">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900">
            Sign In to PropSpace
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            Welcome back! Connect with buyers, manage your portfolio listings, or explore rentals.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-semibold mb-6 flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="username or email"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                id="login-username-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                id="login-password-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-100 disabled:opacity-75 transition-all mt-4"
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Demo Bypass */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={handleDemoLogin}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
            id="demo-login-bypass-btn"
          >
            Use Demo Listing Agent Credentials
          </button>
        </div>

        {/* Footer Redirect */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
            id="register-redirect-btn"
          >
            Sign up now
          </button>
        </div>
      </div>
    </div>
  );
}
