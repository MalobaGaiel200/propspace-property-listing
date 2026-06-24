import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bed, Bath, Square, MapPin, Building, Phone, Mail, User as UserIcon, Send, Heart, CheckCircle2, Loader2 } from 'lucide-react';
import { Property, User } from '../types';
import { formatPropertyPrice } from '../utils/currency';

interface PropertyDetailProps {
  propertyId: string;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  currentUserId?: string;
}

export default function PropertyDetail({
  propertyId,
  onBack,
  favorites,
  onToggleFavorite,
  currentUserId,
}: PropertyDetailProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Contact form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [messageText, setMessageText] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState('');

  const isFavorited = favorites.includes(propertyId);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/properties/${propertyId}`);
        if (!res.ok) {
          throw new Error('Property listing could not be found');
        }
        const data = await res.json();
        setProperty(data);
        setActiveImageIdx(0);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [propertyId]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !messageText) {
      setContactError('Please fill in all required fields (Name, Email, Message)');
      return;
    }

    try {
      setContactLoading(true);
      setContactError('');
      const res = await fetch(`/api/properties/${propertyId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName,
          senderEmail,
          senderPhone,
          messageText,
          senderId: currentUserId
        })
      });

      if (!res.ok) {
        throw new Error('Could not deliver your inquiry. Please try again.');
      }

      setContactSuccess(true);
      setMessageText('');
    } catch (err: any) {
      setContactError(err.message || 'An error occurred. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const formatCurrency = (amount: number, status: string) => {
    return formatPropertyPrice(amount, property?.location.country, status);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" id="property-detail-loading">
        <LoaderSpinner />
        <span className="block mt-4 text-slate-500 text-sm font-semibold">Loading listing specifications...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" id="property-detail-error">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowLeft className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Listing Not Found</h3>
        <p className="text-slate-500 text-sm mb-6">{error || 'This property might have been removed or soft-deleted.'}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings Feed
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id={`property-detail-view-${property.id}`}>
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-white text-slate-700 cursor-pointer shadow-xs mb-6 transition-all"
        id="detail-back-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings Feed
      </button>

      {/* Hero Header Title & Price */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                property.status === 'For Rent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {property.status}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              <Building className="w-3.5 h-3.5" />
              {property.propertyType}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-950 tracking-tight" id="detail-title">
            {property.title}
          </h1>
          <div className="flex items-start gap-1 text-slate-500 text-sm mt-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
            <span>
              {property.location.address ? `${property.location.address}, ` : ''}
              {property.location.city}, {property.location.country}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Price</span>
            <span className="text-2xl md:text-3xl font-display font-black text-blue-600" id="detail-price">
              {formatCurrency(property.price, property.status)}
            </span>
          </div>

          <button
            onClick={() => onToggleFavorite(property.id)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                : 'border-slate-200 hover:border-slate-300 text-slate-400 hover:text-rose-500 bg-white'
            }`}
            id="detail-favorite-btn"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gallery & Description Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Showcase Image */}
          <div className="bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 aspect-video relative">
            <img
              src={property.imageUrls[activeImageIdx]}
              alt={`${property.title} - Full Size`}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Thumbnails grid */}
          {property.imageUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-3" id="detail-thumbnails-grid">
              {property.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-100 ${
                    activeImageIdx === idx
                      ? 'border-blue-600 scale-95 opacity-100 shadow-md shadow-blue-100'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={url}
                    alt={`${property.title} - Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Quick Metrics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 grid grid-cols-3 gap-4 text-center">
            {property.bedrooms !== undefined && (
              <div className="border-r border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bedrooms</span>
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold">
                  <Bed className="w-5 h-5 text-slate-400" />
                  <span className="text-lg font-display">{property.bedrooms}</span>
                </div>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="border-r border-slate-100">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Bathrooms</span>
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold">
                  <Bath className="w-5 h-5 text-slate-400" />
                  <span className="text-lg font-display">{property.bathrooms}</span>
                </div>
              </div>
            )}
            {property.area !== undefined && (
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Area</span>
                <div className="flex items-center justify-center gap-1.5 text-slate-800 font-bold">
                  <Square className="w-4 h-4 text-slate-400" />
                  <span className="text-lg font-display">{property.area} m²</span>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Property Description
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line" id="detail-description">
              {property.description}
            </p>
          </div>
        </div>

        {/* Contact & Owner Profile Sidebar */}
        <div className="space-y-6">
          {/* Owner Profile Card */}
          {property.owner && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Listed By</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={property.owner.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'}
                  alt={property.owner.fullName}
                  className="w-12 h-12 rounded-full border border-slate-100 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-base font-bold text-slate-900">{property.owner.fullName}</h4>
                  <span className="text-xs text-slate-500">Professional Agent</span>
                </div>
              </div>
              {property.owner.bio && (
                <p className="text-slate-500 text-xs leading-relaxed mb-4 italic">
                  "{property.owner.bio}"
                </p>
              )}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                {property.owner.phoneNumber && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{property.owner.phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{property.owner.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Inquiry Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm" id="detail-contact-form-container">
            <h3 className="text-base font-bold text-slate-900 mb-1">Make an Inquiry</h3>
            <p className="text-slate-500 text-xs mb-4">
              Send a direct message to request details, schedule a tour, or make an offer.
            </p>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center animate-in zoom-in duration-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-emerald-950 mb-1">Inquiry Delivered!</h4>
                <p className="text-emerald-700 text-xs leading-relaxed mb-4">
                  Your message has been safely sent to the listing host. They will follow up via your email shortly.
                </p>
                <button
                  onClick={() => setContactSuccess(false)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                {contactError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg font-medium">
                    {contactError}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Inquiry Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your message here... (e.g., I would love to schedule a viewing)"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-75"
                  id="inquiry-submit-btn"
                >
                  {contactLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Inquiry...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple embedded LoaderSpinner component
function LoaderSpinner() {
  return (
    <div className="inline-flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );
}
