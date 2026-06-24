import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface Favorite {
  id: string;
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  properties: Property[];
  favorites: Favorite[];
}

// Ensure the data directory and db.json exist
function initDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const defaultData: DatabaseSchema = {
      users: [],
      properties: [],
      favorites: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

export function readDb(): DatabaseSchema {
  initDb();
  try {
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content) as DatabaseSchema;
  } catch (error) {
    console.error('Error reading database file, returning empty state:', error);
    return { users: [], properties: [], favorites: [] };
  }
}

export function writeDb(data: DatabaseSchema): void {
  initDb();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

// ID Generator helper
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}
