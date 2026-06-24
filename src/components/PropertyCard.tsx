import React from 'react';
import { Bed, Bath, Square, MapPin, Heart, Edit2, Trash2, Eye } from 'lucide-react';
import { Property } from '../types';
import { formatPropertyPrice } from '../utils/currency';

interface PropertyCardProps {
  key?: string | number;
  property: Property;
  isFavorited: boolean;
  onToggleFavorite?: (propertyId: string) => void;
  onSelectProperty: (propertyId: string) => void;
  currentUserId?: string;
  onEdit?: (propertyId: string) => void;
  onDelete?: (propertyId: string) => void;
}

export default function PropertyCard({
  property,
  isFavorited,
  onToggleFavorite,
  onSelectProperty,
  currentUserId,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  const isOwner = currentUserId && property.userId === currentUserId;

  const formatPrice = (price: number, status: string) => {
    return formatPropertyPrice(price, property.location.country, status);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-150 overflow-hidden hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 flex flex-col group h-full relative"
      id={`property-card-${property.id}`}
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        <img
          src={property.imageUrls[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Status Badge */}
        <span
          className={`absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${
            property.status === 'For Rent'
              ? 'bg-blue-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
          id={`property-status-badge-${property.id}`}
        >
          {property.status}
        </span>

        {/* Property Type Badge */}
        <span className="absolute top-4 right-4 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 text-slate-900 backdrop-blur-xs shadow-xs">
          {property.propertyType}
        </span>

        {/* Favorite Button (Only if onToggleFavorite is provided) */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`absolute bottom-4 right-4 p-2 rounded-full backdrop-blur-xs shadow-sm transition-all cursor-pointer ${
              isFavorited
                ? 'bg-rose-500 text-white scale-110 hover:bg-rose-600'
                : 'bg-white/90 text-slate-600 hover:text-rose-500 hover:bg-white hover:scale-110'
            }`}
            id={`property-favorite-btn-${property.id}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          {/* Price */}
          <div className="text-xl font-display font-bold text-slate-900 mb-1" id={`property-price-${property.id}`}>
            {formatPrice(property.price, property.status)}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectProperty(property.id)}
            className="text-base font-bold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer mb-2"
            id={`property-title-${property.id}`}
          >
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-start gap-1 text-slate-500 text-xs mb-4">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span className="line-clamp-1">
              {property.location.address ? `${property.location.address}, ` : ''}
              {property.location.city}, {property.location.country}
            </span>
          </div>
        </div>

        {/* Metrics Footer */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-slate-600 text-xs gap-2">
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1.5" title="Bedrooms">
              <Bed className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">{property.bedrooms}</span>
              <span>Beds</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1.5" title="Bathrooms">
              <Bath className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-800">{property.bathrooms}</span>
              <span>Baths</span>
            </div>
          )}
          {property.area !== undefined && (
            <div className="flex items-center gap-1.5" title="Area">
              <Square className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{property.area}</span>
              <span>m²</span>
            </div>
          )}
        </div>

        {/* Quick Admin Actions (Owners only) */}
        {isOwner && (onEdit || onDelete) && (
          <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-end gap-2">
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mr-auto bg-blue-50 px-2 py-0.5 rounded-sm">
              My Listing
            </span>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(property.id);
                }}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title="Edit listing"
                id={`property-edit-btn-${property.id}`}
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(property.id);
                }}
                className="p-1.5 rounded-md hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                title="Delete listing"
                id={`property-delete-btn-${property.id}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onSelectProperty(property.id)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="View full listing details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
