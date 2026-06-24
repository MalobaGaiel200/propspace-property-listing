import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Loader2, Save, Image as ImageIcon, Upload, CheckCircle2 } from 'lucide-react';
import { Property } from '../types';

interface PropertyFormProps {
  propertyId?: string | null; // If provided, we are in EDIT mode
  token: string;
  onBack: () => void;
  onSuccess: (message: string) => void;
}

export default function PropertyForm({ propertyId, token, onBack, onSuccess }: PropertyFormProps) {
  const isEditMode = !!propertyId;

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Field States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Cameroon');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Apartment');
  const [status, setStatus] = useState('For Rent');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  // Fetch property details if in edit mode
  useEffect(() => {
    if (!isEditMode || !propertyId) return;

    const fetchPropertyData = async () => {
      try {
        setFetching(true);
        const res = await fetch(`/api/properties/${propertyId}`);
        if (!res.ok) {
          throw new Error('Could not fetch existing property details');
        }
        const data: Property = await res.json();

        // Populate form states
        setTitle(data.title);
        setDescription(data.description);
        setPrice(String(data.price));
        setCity(data.location.city);
        setCountry(data.location.country);
        setAddress(data.location.address || '');
        setPropertyType(data.propertyType);
        setStatus(data.status);
        setBedrooms(data.bedrooms ? String(data.bedrooms) : '');
        setBathrooms(data.bathrooms ? String(data.bathrooms) : '');
        setArea(data.area ? String(data.area) : '');
        setImageUrls(data.imageUrls.length > 0 ? [...data.imageUrls] : ['']);
      } catch (err: any) {
        setFormError(err.message || 'Failed to populate property form data.');
      } finally {
        setFetching(false);
      }
    };

    fetchPropertyData();
  }, [propertyId, isEditMode]);

  // Image inputs handling
  const handleImageUrlChange = (idx: number, val: string) => {
    const updated = [...imageUrls];
    updated[idx] = val;
    setImageUrls(updated);
  };

  const addImageUrlField = () => {
    if (imageUrls.length >= 5) return;
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrlField = (idx: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
      return;
    }
    const updated = imageUrls.filter((_, i) => i !== idx);
    setImageUrls(updated);
  };

  const handleFileChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleImageUrlChange(idx, base64String);
    };
    reader.readAsDataURL(file);
  };

  const getCurrencySymbol = () => {
    const isCameroon = !country || country.toLowerCase().includes('cameroon') || country.toLowerCase().includes('cameroun');
    return isCameroon ? 'FCFA' : '$';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Field level validations
    if (!title.trim() || title.length > 100) {
      setFormError('Title is required and must be under 100 characters.');
      return;
    }

    if (!description.trim() || description.length < 20 || description.length > 2000) {
      setFormError('Description is required (minimum 20 and maximum 2000 characters).');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid positive price amount.');
      return;
    }

    if (!city.trim() || !country.trim()) {
      setFormError('Both city and country location fields are required.');
      return;
    }

    // Prepare payload
    const payload = {
      title,
      description,
      price: numPrice,
      location: {
        city,
        country,
        address,
      },
      propertyType,
      status,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
      area: area ? parseFloat(area) : undefined,
      imageUrls: imageUrls.filter(url => url.trim() !== ''),
    };

    try {
      setLoading(true);
      const url = isEditMode ? `/api/properties/${propertyId}` : '/api/properties';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit property listing.');
      }

      onSuccess(isEditMode ? 'Listing updated successfully!' : 'Listing published successfully!');
    } catch (err: any) {
      setFormError(err.message || 'An error occurred during listing submission.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoListing = () => {
    setTitle('Spacious Penthouse with Private Terrace in Bastos');
    setDescription('Beautiful, ultra-modern penthouse situated in a premium residential neighborhood of Bastos, Yaoundé. Features master bedrooms with en-suite baths, professional gas range chef kitchen, floor-to-ceiling panoramic views, and a massive private terrace. Ready for move-in!');
    setPrice('1500000');
    setCity('Yaoundé');
    setCountry('Cameroon');
    setAddress('Rue de Bastos, Yaoundé');
    setPropertyType('Apartment');
    setStatus('For Rent');
    setBedrooms('3');
    setBathrooms('2');
    setArea('165');
    setImageUrls([
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600'
    ]);
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <span className="block mt-4 text-slate-500 text-sm font-semibold">Loading listing data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="property-form-view">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel and Back
          </button>
          <h1 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight" id="property-form-title">
            {isEditMode ? 'Modify Listing Specifications' : 'Publish New Property Listing'}
          </h1>
        </div>

        {!isEditMode && (
          <button
            type="button"
            onClick={loadDemoListing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Auto-fill Mock Data
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {formError && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-6 py-4 font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 mb-4">
              1. Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Property Listing Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Modern 3-Bed Penthouse with Panoramic Views"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="form-title-input"
                />
                <span className="block text-[10px] text-slate-400 mt-1 text-right">
                  {title.length}/100 characters
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Comprehensive Description *
                </label>
                <textarea
                  required
                  rows={5}
                  minLength={20}
                  maxLength={2000}
                  placeholder="Describe the property's features, interior layout, community highlights, public transport access, and specific lease or purchase rules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 resize-none"
                  id="form-description-input"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Minimum 20 characters</span>
                  <span>{description.length}/2000 characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Core Specs */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 mb-4">
              2. Transaction & Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Price */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price ({getCurrencySymbol()}) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold uppercase">
                    {getCurrencySymbol()}
                  </span>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="any"
                    placeholder={getCurrencySymbol() === 'FCFA' ? 'e.g. 150000 (rent) or 45000000 (sale)' : 'e.g. 4500 (rent) or 850000 (sale)'}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full ${getCurrencySymbol() === 'FCFA' ? 'pl-16' : 'pl-8'} pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50`}
                    id="form-price-input"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Listing Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 font-semibold text-slate-800"
                >
                  <option value="For Rent">For Rent</option>
                  <option value="For Sale">For Sale</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Property Type *
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50 font-semibold text-slate-800"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Studio">Studio</option>
                  <option value="Villa">Villa</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 3"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 2.5"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>

              {/* Area */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Total Area (Square Meters - m²)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 125"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Geographic Location */}
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 mb-4">
              3. Geographic Location
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="form-city-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                  id="form-country-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Street Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 456 California St, Apt 2C"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Property Images */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                4. Property Images (File or URL)
              </h2>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                Max 5 Images
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Provide direct high-resolution web links to your property images, OR browse and upload local image files from your device. If left empty, a beautiful default matching the property type will be automatically assigned.
            </p>

            <div className="space-y-4" id="form-image-urls-list">
              {imageUrls.map((url, idx) => {
                const isBase64 = url && url.startsWith('data:image/');
                return (
                  <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Image #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 cursor-pointer transition-colors"
                        title="Remove this slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      {/* Image Thumbnail / Indicator */}
                      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {url ? (
                          <img src={url} alt={`Slot #${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      {/* URL or File Selector */}
                      <div className="flex-1 w-full space-y-2">
                        {isBase64 ? (
                          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg px-3 py-2 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Successfully uploaded local image!</span>
                            <button
                              type="button"
                              onClick={() => handleImageUrlChange(idx, '')}
                              className="ml-auto text-emerald-700 hover:text-emerald-950 underline cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* URL input */}
                            <div className="relative flex-1">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="url"
                                placeholder="Pasted image web link (https://...)"
                                value={url}
                                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 bg-white"
                              />
                            </div>

                            {/* File Upload Selector */}
                            <div className="relative">
                              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-xs">
                                <Upload className="w-3.5 h-3.5 text-slate-500" />
                                <span>Upload File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(idx, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={addImageUrlField}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer transition-all mt-2"
                  id="add-image-url-field-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another Image Slot ({imageUrls.length}/5)
                </button>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="border-t border-slate-150 pt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-100 disabled:opacity-75"
              id="form-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting specifications...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Save Changes' : 'Publish Listing'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
