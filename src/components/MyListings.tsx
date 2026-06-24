import React, { useState, useEffect } from 'react';
import { Building, Edit2, Trash2, Eye, PlusCircle, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { Property } from '../types';
import { formatPropertyPrice } from '../utils/currency';

interface MyListingsProps {
  token: string;
  onEdit: (propertyId: string) => void;
  onSelectProperty: (propertyId: string) => void;
  setActiveView: (view: string) => void;
}

export default function MyListings({ token, onEdit, onSelectProperty, setActiveView }: MyListingsProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Delete modal confirmation states
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve user property portfolio listings.');
      }

      const data = await res.json();
      setProperties(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProperties();
  }, [token]);

  const handleDeleteTrigger = (id: string) => {
    setDeletePropertyId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletePropertyId) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/properties/${deletePropertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Could not delete the property listing.');
      }

      // Remove from state
      setProperties(properties.filter(p => p.id !== deletePropertyId));
      setFeedback('Property listing deleted successfully!');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete deletion request.');
    } finally {
      setDeleting(false);
      setDeletePropertyId(null);
    }
  };

  const formatPrice = (price: number, status: string, country: string = 'Cameroon') => {
    return formatPropertyPrice(price, country, status);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center" id="mylistings-loading">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <span className="block mt-4 text-slate-500 text-sm font-semibold">Opening portfolio...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="mylistings-view">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600" />
            My Active Property Listings
          </h1>
          <p className="text-slate-500 text-sm">
            Review, edit specifications, or remove your published properties.
          </p>
        </div>

        <button
          onClick={() => setActiveView('add-property')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md cursor-pointer self-start sm:self-auto"
          id="mylistings-publish-btn"
        >
          <PlusCircle className="w-4 h-4" />
          Publish New Listing
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-xl font-semibold mb-6 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl font-semibold mb-6">
          {error}
        </div>
      )}

      {properties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Published Properties</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            You haven't listed any property portfolios yet. Publish an apartment, house, studio, or commercial space now to capture leads!
          </p>
          <button
            onClick={() => setActiveView('add-property')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm cursor-pointer"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        /* Listings Table Grid */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="mylistings-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Property Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price Spec</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors" id={`mylistings-row-${prop.id}`}>
                    {/* Details column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.imageUrls[0]}
                          alt={prop.title}
                          className="w-14 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span
                            onClick={() => onSelectProperty(prop.id)}
                            className="font-bold text-slate-850 hover:text-blue-600 transition-colors block line-clamp-1 cursor-pointer"
                          >
                            {prop.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Added on {new Date(prop.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category column */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 text-xs">{prop.propertyType}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wide w-fit ${
                            prop.status === 'For Rent'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {prop.status.replace('For ', '')}
                        </span>
                      </div>
                    </td>

                    {/* Price Spec column */}
                    <td className="py-4 px-6 font-display font-black text-slate-900">
                      {formatPrice(prop.price, prop.status, prop.location.country)}
                    </td>

                    {/* Location column */}
                    <td className="py-4 px-6 text-slate-500 text-xs">
                      {prop.location.city}, {prop.location.country}
                    </td>

                    {/* Actions column */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProperty(prop.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Inspect full page"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(prop.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Edit specs"
                          id={`mylistings-edit-${prop.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(prop.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove listing"
                          id={`mylistings-delete-${prop.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      {deletePropertyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" id="delete-confirmation-modal">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setDeletePropertyId(null)} />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative z-10 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Property Listing?</h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Are you sure you want to remove this property listing from the marketplace? This action is irreversible, and interested buyers will lose access to contact you.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletePropertyId(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
                id="confirm-delete-btn"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
