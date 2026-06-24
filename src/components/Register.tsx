import React, { useState } from 'react';
import { User, Mail, Key, ShieldCheck, Loader2, ArrowRight, Building, Smartphone, FileText, Image as ImageIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface RegisterProps {
  onRegisterSuccess: (token: string, user: UserType) => void;
  onNavigateToLogin: () => void;
}

export default function Register({ onRegisterSuccess, onNavigateToLogin }: RegisterProps) {
  // Fields state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  // Status state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-flight Validations
    if (!username.trim() || !email.trim() || !password || !fullName.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address format.');
      return;
    }

    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must be at least 8 characters long and contain at least one number and special character (e.g., !@#$%).');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          fullName,
          phoneNumber,
          avatarUrl: avatarUrl || undefined,
          bio
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      onRegisterSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto px-4 py-8" id="register-view">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-blue-200 mb-3">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-black tracking-tight text-slate-900">
            Create an Account
          </h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            Register as a seller, broker, or simple buyer to unlock premium listings options.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-semibold mb-5 flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="register-fullname-input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="register-email-input"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Username *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe_99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="register-username-input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Secure Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters, 1 number, 1 symbol"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="register-password-input"
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Avatar URL (Optional) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Avatar Image URL (Optional)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Bio (Optional) */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Biography description (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={3}
                  placeholder="Describe your credentials, agency group, or real estate experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-100 disabled:opacity-75 transition-all mt-4"
            id="register-submit-btn"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Sign Up Now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Redirect Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already registered?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
            id="login-redirect-btn"
          >
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  );
}
