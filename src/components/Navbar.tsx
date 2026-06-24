import React, { useState } from 'react';
import { Home, LayoutDashboard, PlusCircle, User as UserIcon, LogOut, Menu, X, Building, MessageSquare } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, activeView, setActiveView, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigation = [
    { name: 'Browse Properties', view: 'properties', icon: Home, show: true },
    { name: 'Dashboard', view: 'dashboard', icon: LayoutDashboard, show: !!user },
    { name: 'My Listings', view: 'my-listings', icon: Building, show: !!user },
    { name: 'Add Property', view: 'add-property', icon: PlusCircle, show: !!user },
    { name: 'Messages', view: 'messages', icon: MessageSquare, show: !!user },
  ];

  const handleNavClick = (view: string) => {
    setActiveView(view);
    setIsOpen(false);
    setShowDropdown(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="propspace-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('properties')}
              className="flex items-center gap-2 cursor-pointer group"
              id="navbar-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200 group-hover:bg-blue-700 transition-colors">
                <Building className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                Prop<span className="text-blue-600">Space</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  id={`nav-link-${item.view}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-hidden cursor-pointer group p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  id="user-profile-menu-button"
                >
                  <img
                    className="h-8 h-8 rounded-full border border-slate-200 object-cover"
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                </button>

                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white border border-slate-100 ring-1 ring-black/5 focus:outline-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-150"
                      id="user-dropdown-menu"
                    >
                      <button
                        onClick={() => handleNavClick('profile')}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                        id="dropdown-profile-btn"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </button>
                      <hr className="border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          onLogout();
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-medium"
                        id="dropdown-logout-btn"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                  id="login-nav-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-100 hover:shadow-md transition-all cursor-pointer"
                  id="register-nav-btn"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              id="mobile-menu-button"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white" id="mobile-navigation-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              const isActive = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-base font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  id={`mobile-nav-link-${item.view}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* User Section (Mobile) */}
          <div className="pt-4 pb-4 border-t border-slate-200 px-4">
            {user ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-base font-semibold text-slate-950">{user.fullName}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                    id="mobile-profile-btn"
                  >
                    <UserIcon className="w-5 h-5 text-slate-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    id="mobile-logout-btn"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                  id="mobile-login-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                  id="mobile-register-btn"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
