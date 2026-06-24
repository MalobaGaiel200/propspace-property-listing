import React, { useState, useEffect } from 'react';
import { Info, MessageSquare, Plus, Search, Building, Star, LogIn, Heart, LogOut, CheckCircle } from 'lucide-react';
import { Property, User } from './types';
import Navbar from './components/Navbar';
import PropertyList from './components/PropertyList';
import PropertyDetail from './components/PropertyDetail';
import PropertyForm from './components/PropertyForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import MessagesInbox from './components/MessagesInbox';
import Login from './components/Login';
import Register from './components/Register';
import MyListings from './components/MyListings';

export default function App() {
  // Authentication state
  const [token, setToken] = useState<string | null>(localStorage.getItem('propspace_token'));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App Routing State
  const [activeView, setActiveView] = useState<string>('properties');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [editPropertyId, setEditPropertyId] = useState<string | null>(null);

  // Core Listings state
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Trigger temporary notification toast
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Fetch properties on launch or when triggered
  const fetchAllProperties = async () => {
    try {
      setLoadingProperties(true);
      const res = await fetch('/api/properties');
      if (!res.ok) {
        throw new Error('Failed to retrieve listings');
      }
      const data = await res.json();
      setProperties(data);
    } catch (err: any) {
      showToast(err.message || 'Error occurred while loading properties.', 'error');
    } finally {
      setLoadingProperties(false);
    }
  };

  // 2. Fetch user favorites if authenticated
  const fetchFavorites = async (authToken: string) => {
    try {
      const res = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data: Property[] = await res.json();
        setFavorites(data.map(p => p.id));
      }
    } catch (err) {
      console.error('Error loading favorites on init:', err);
    }
  };

  // 3. Verify user authentication session on boot
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Sync favorites
          await fetchFavorites(token);
        } else {
          // Token expired or invalid
          localStorage.removeItem('propspace_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    verifySession();
    fetchAllProperties();
  }, [token]);

  // Handle Login Event
  const handleLoginSuccess = (userToken: string, loggedUser: User) => {
    localStorage.setItem('propspace_token', userToken);
    setToken(userToken);
    setUser(loggedUser);
    setActiveView('properties');
    showToast(`Welcome back, ${loggedUser.fullName}!`);
  };

  // Handle Registration Event
  const handleRegisterSuccess = (userToken: string, registeredUser: User) => {
    localStorage.setItem('propspace_token', userToken);
    setToken(userToken);
    setUser(registeredUser);
    setActiveView('properties');
    showToast(`Account created successfully! Welcome, ${registeredUser.fullName}!`);
  };

  // Handle Logout Event
  const handleLogout = () => {
    localStorage.removeItem('propspace_token');
    setToken(null);
    setUser(null);
    setFavorites([]);
    setActiveView('properties');
    showToast('Signed out of PropSpace successfully.');
  };

  // Handle Favorites toggle
  const handleToggleFavorite = async (propertyId: string) => {
    if (!token || !user) {
      setActiveView('login');
      showToast('Please sign in to save favorite property listings.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/favorites/${propertyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to toggle bookmark');
      }

      const data = await res.json();
      if (data.favorited) {
        setFavorites([...favorites, propertyId]);
        showToast('Added to your Saved Favorites!');
      } else {
        setFavorites(favorites.filter(id => id !== propertyId));
        showToast('Removed from your Saved Favorites.');
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred while updating favorites.', 'error');
    }
  };

  // Routing View selectors
  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    setActiveView('property-detail');
  };

  const handleEditProperty = (id: string) => {
    setEditPropertyId(id);
    setActiveView('edit-property');
  };

  const handleFormSuccess = (msg: string) => {
    setActiveView('my-listings');
    fetchAllProperties();
    showToast(msg);
  };

  const renderActiveView = () => {
    if (authLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
          <span className="block mt-4 text-slate-500 text-sm font-semibold">Configuring secure session gates...</span>
        </div>
      );
    }

    switch (activeView) {
      case 'properties':
        return (
          <PropertyList
            properties={properties}
            favorites={favorites}
            loading={loadingProperties}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={handleSelectProperty}
            currentUserId={user?.id}
            onEditProperty={handleEditProperty}
            onDeleteProperty={(id) => {
              setProperties(properties.filter(p => p.id !== id));
              showToast('Listing deleted successfully!');
            }}
          />
        );

      case 'property-detail':
        return selectedPropertyId ? (
          <PropertyDetail
            propertyId={selectedPropertyId}
            onBack={() => {
              setSelectedPropertyId(null);
              setActiveView('properties');
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            currentUserId={user?.id}
          />
        ) : (
          <div className="text-center py-12">No property selected</div>
        );

      case 'add-property':
        return token ? (
          <PropertyForm
            token={token}
            onBack={() => setActiveView('properties')}
            onSuccess={handleFormSuccess}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setActiveView('register')} />
        );

      case 'edit-property':
        return token && editPropertyId ? (
          <PropertyForm
            propertyId={editPropertyId}
            token={token}
            onBack={() => {
              setEditPropertyId(null);
              setActiveView('my-listings');
            }}
            onSuccess={(msg) => {
              setEditPropertyId(null);
              handleFormSuccess(msg);
            }}
          />
        ) : (
          <div className="text-center py-12">No property targetted for editing</div>
        );

      case 'dashboard':
        return token && user ? (
          <Dashboard token={token} user={user} setActiveView={setActiveView} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setActiveView('register')} />
        );

      case 'my-listings':
        return token ? (
          <MyListings
            token={token}
            onEdit={handleEditProperty}
            onSelectProperty={handleSelectProperty}
            setActiveView={setActiveView}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setActiveView('register')} />
        );

      case 'messages':
        return token ? (
          <MessagesInbox
            token={token}
            onSelectProperty={handleSelectProperty}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setActiveView('register')} />
        );

      case 'profile':
        return token && user ? (
          <Profile
            token={token}
            user={user}
            onProfileUpdate={(updatedUser) => setUser(updatedUser)}
          />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setActiveView('register')} />
        );

      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setActiveView('register')}
          />
        );

      case 'register':
        return (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setActiveView('login')}
          />
        );

      default:
        return <div className="text-center py-12">View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="propspace-app">
      {/* Toast Notification HUD banner */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl border border-slate-100 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 ${
            toastType === 'success'
              ? 'bg-white/95 text-slate-800'
              : 'bg-red-50 text-red-850 border-red-200'
          }`}
          id="global-toast-notification"
        >
          {toastType === 'success' ? (
            <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
          )}
          <span className="text-xs font-semibold leading-none">{toastMessage}</span>
        </div>
      )}

      {/* Navbar header */}
      <Navbar
        user={user}
        activeView={activeView}
        setActiveView={(view) => {
          setSelectedPropertyId(null);
          setEditPropertyId(null);
          setActiveView(view);
        }}
        onLogout={handleLogout}
      />

      {/* Primary Dynamic Content Body */}
      <main className="flex-1 pb-16">
        {renderActiveView()}
      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>© 2026 PropSpace Inc. Built with React & Node.js/Express. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
