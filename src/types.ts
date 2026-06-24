export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: {
    city: string;
    country: string;
    address?: string;
  };
  propertyType: 'Apartment' | 'House' | 'Studio' | 'Villa' | 'Commercial';
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  imageUrls: string[];
  status: 'For Rent' | 'For Sale';
  userId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  owner?: {
    fullName: string;
    phoneNumber?: string;
    avatarUrl?: string;
    email: string;
  } | null;
}

export interface Message {
  id: string;
  propertyId: string;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  messageText: string;
  ownerId: string;
  createdAt: string;
}

export interface DashboardStats {
  myTotalListings: number;
  myRentalsCount: number;
  mySalesCount: number;
  totalLikesOnMyProperties: number;
  receivedMessagesCount: number;
  propertiesByType: { name: string; count: number }[];
  marketDistribution: { name: string; value: number }[];
  cityDistribution: { name: string; value: number }[];
}
