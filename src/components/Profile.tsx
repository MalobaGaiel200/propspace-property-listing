import React, { useState } from 'react';
import { User, Key, Save, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  token: string;
  user: UserType;
  onProfileUpdate: (updatedUser: UserType) => void;
}

export default function Profile({ token, user, onProfileUpdate }: ProfileProps) {
  // Profile Form States
  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [bio, setBio] = useState(user.bio || '');

  // Profile status
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password status
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Profile Save
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name is a required field.');
      return;
    }

    try {
      setProfileLoading(true);
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          avatarUrl,
          bio
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not update profile information.');
      }

      onProfileUpdate(data.user);
      setProfileSuccess('Profile information updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'An error occurred. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password Save
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password fields must match.');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordError('New password must be at least 8 characters long and contain at least one number and special character.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect current password or update failed.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="profile-view">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
          My Account Settings
        </h1>
        <p className="text-slate-500 text-sm">
          Manage your contact credentials, bio description, avatar visuals, and core credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Quick card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-xs">
            <div className="relative inline-block mb-4">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'}
                alt={user.fullName}
                className="w-24 h-24 rounded-full border-2 border-blue-500 mx-auto object-cover p-0.5"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{user.fullName}</h2>
            <p className="text-slate-500 text-xs mb-4">@{user.username}</p>

            <div className="border-t border-slate-100 pt-4 text-left space-y-2 text-xs">
              <div>
                <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="text-slate-700 font-medium truncate block">{user.email}</span>
              </div>
              {phoneNumber && (
                <div>
                  <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Phone Number</span>
                  <span className="text-slate-700 font-medium">{phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Form 1: General Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Profile Details
              </h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              {profileSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {profileSuccess}
                </div>
              )}

              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-semibold">
                  {profileError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Short Biography / Description</label>
                  <textarea
                    rows={4}
                    placeholder="Share some details about yourself or your real estate agency..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  id="profile-save-btn"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Password Change */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Change Account Password
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {passwordSuccess}
                </div>
              )}

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-750 text-xs p-3.5 rounded-xl font-semibold flex items-start gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Verify your active password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  id="password-save-btn"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
