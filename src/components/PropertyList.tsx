import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, Loader2, RefreshCw } from 'lucide-react';
import { Property } from '../types';
import PropertyCard from './PropertyCard';

interface PropertyListProps {
  properties: Property[];
  favorites: string[];
  loading: boolean;
  onToggleFavorite: (id: string) => void;
  onSelectProperty: (id: string) => void;
  currentUserId?: string;
  onEditProperty?: (id: string) => void;
  onDeleteProperty?: (id: string) => void;
}

export default function PropertyList({
  properties,
  favorites,
  loading,
  onToggleFavorite,
  onSelectProperty,
  currentUserId,
  onEditProperty,
  onDeleteProperty,
}: PropertyListProps) {
  // Filter states
  const [search, setSearch] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [status, setStatus] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('Any');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Local filtered properties
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  useEffect(() => {
    let result = [...properties];

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.location.city.toLowerCase().includes(q) ||
        p.location.country.toLowerCase().includes(q) ||
        (p.location.address && p.location.address.toLowerCase().includes(q))
      );
    }

    // Property Type
    if (propertyType !== 'All') {
      result = result.filter(p => p.propertyType === propertyType);
    }

    // Status (Rent/Sale)
    if (status !== 'All') {
      result = result.filter(p => p.status === status);
    }

    // Min Price
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        result = result.filter(p => p.price >= min);
      }
    }

    // Max Price
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        result = result.filter(p => p.price <= max);
      }
    }

    // Bedrooms
    if (bedrooms !== 'Any') {
      const beds = parseInt(bedrooms, 10);
      if (!isNaN(beds)) {
        if (beds === 5) {
          result = result.filter(p => (p.bedrooms || 0) >= 5);
        } else {
          result = result.filter(p => p.bedrooms === beds);
        }
      }
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'area-asc':
        result.sort((a, b) => (a.area || 0) - (b.area || 0));
        break;
      case 'area-desc':
        result.sort((a, b) => (b.area || 0) - (a.area || 0));
        break;
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setFilteredProperties(result);
  }, [properties, search, propertyType, status, minPrice, maxPrice, bedrooms, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setPropertyType('All');
    setStatus('All');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('Any');
    setSortBy('date-desc');
  };

  const propertyTypes = ['All', 'Apartment', 'House', 'Studio', 'Villa', 'Commercial'];
  const statuses = ['All', 'For Rent', 'For Sale'];
  const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="property-list-view">
      {/* Hero Search Section */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-10 text-white mb-8 shadow-xl shadow-slate-200 relative overflow-hidden">
        {/* Abstract background blur shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full">
            Premium Marketplace
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mt-4 mb-4 leading-tight">
            Discover Your Perfect Space
          </h1>
          <p className="text-slate-300 text-sm md:text-lg font-light mb-8 max-w-xl leading-relaxed">
            Browse verified apartments, modern villas, houses, and premium commercial spaces for rent or sale.
          </p>

          {/* Quick search bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/15">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by city, country, title, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-white pl-12 pr-4 py-3 focus:ring-0 focus:outline-hidden text-sm placeholder-slate-400"
                id="hero-search-input"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar (Desktop) */}
        <div className="hidden lg:block w-72 shrink-0 bg-white p-6 rounded-2xl border border-slate-200 sticky top-20 self-start">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              Refine Search
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer flex items-center gap-1"
              id="clear-filters-btn-desktop"
            >
              <RefreshCw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-6">
            {/* Status (Rent / Sale) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Listing Status</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      status === s
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {s.replace('For ', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Property Type</label>
              <div className="space-y-1.5">
                {propertyTypes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPropertyType(t)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      propertyType === t
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{t}</span>
                    {propertyType === t && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Price Range (FCFA / $)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Bedrooms</label>
              <div className="grid grid-cols-3 gap-1.5">
                {bedroomOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setBedrooms(opt)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      bedrooms === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listings Area */}
        <div className="flex-1">
          {/* Topbar: sorting and mobile filters trigger */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-600 text-sm font-medium self-start sm:self-auto">
              Showing <span className="font-bold text-slate-900">{filteredProperties.length}</span> properties
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-end">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <span className="shrink-0">Sort By</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                  id="properties-sort-select"
                >
                  <option value="date-desc">Newest Added</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="area-desc">Area: Largest First</option>
                  <option value="area-asc">Area: Smallest First</option>
                </select>
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                Filters
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {(propertyType !== 'All' || status !== 'All' || minPrice || maxPrice || bedrooms !== 'Any') && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
              {status !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                  Status: {status}
                  <button onClick={() => setStatus('All')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {propertyType !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                  Type: {propertyType}
                  <button onClick={() => setPropertyType('All')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                  Price: {minPrice ? `$${minPrice}` : '$0'} - {maxPrice ? `$${maxPrice}` : '∞'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              {bedrooms !== 'Any' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium">
                  Beds: {bedrooms}
                  <button onClick={() => setBedrooms('Any')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline underline-offset-2 ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Property Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="skeleton-loader-grid">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-xs animate-pulse h-[390px] flex flex-col">
                  <div className="bg-slate-200 aspect-video w-full" />
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-6 bg-slate-200 rounded-md w-1/3 mb-2" />
                      <div className="h-5 bg-slate-200 rounded-md w-3/4 mb-3" />
                      <div className="h-4 bg-slate-200 rounded-md w-1/2 mb-4" />
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg w-full mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-xl mx-auto my-8 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Matching Properties Found</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                We couldn't find any listings matching your search terms. Try adjusting your filters, selecting a different property type, or clearing filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="properties-grid">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorited={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProperty={onSelectProperty}
                  currentUserId={currentUserId}
                  onEdit={onEditProperty}
                  onDelete={onDeleteProperty}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" id="mobile-filters-drawer">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Filter Options
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Status (Rent / Sale) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Listing Status</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-150 rounded-xl">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        status === s
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s.replace('For ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Property Type</label>
                <div className="space-y-1.5">
                  {propertyTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setPropertyType(t)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        propertyType === t
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{t}</span>
                      {propertyType === t && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Price Range (FCFA / $)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Bedrooms</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {bedroomOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setBedrooms(opt)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        bedrooms === opt
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2 px-4 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
