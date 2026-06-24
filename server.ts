import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { readDb, writeDb, generateId, User, Property, Favorite } from './server/db.js';

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'propspace_fallback_secret_key_2026';

app.use(express.json());

// Extend Express Request type
interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
  };
}

// Ensure the db structure is complete on startup
const dbInitState = readDb();
if (!dbInitState.favorites) {
  dbInitState.favorites = [];
}
// Add messages table dynamically if not exists
interface Message {
  id: string;
  propertyId: string;
  propertyTitle: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  messageText: string;
  ownerId: string; // recipient
  senderId?: string; // sender if authenticated
  createdAt: string;
}
const rawDb = dbInitState as any;
if (!rawDb.messages) {
  rawDb.messages = [
    {
      id: 'msg_1',
      propertyId: 'prop_1',
      propertyTitle: 'Modern Luxury Penthouse',
      senderName: 'Alice Green',
      senderEmail: 'alice@example.com',
      senderPhone: '+1 (555) 987-6543',
      messageText: 'Hello, I am extremely interested in renting this penthouse. Is it available for a viewing this Saturday morning?',
      ownerId: 'user_demo_1',
      createdAt: new Date().toISOString()
    }
  ];
  writeDb(rawDb);
}

// Authentication Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    };
    next();
  });
};

// ---------------- AUTH API ----------------

// Register
app.post('/api/auth/register', (req: Request, res: Response): void => {
  const { username, email, password, fullName, phoneNumber, avatarUrl, bio } = req.body;

  if (!username || !email || !password || !fullName) {
    res.status(400).json({ error: 'Missing required fields (username, email, password, fullName)' });
    return;
  }

  // Validations
  if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    res.status(400).json({ error: 'Password must be at least 8 characters long and contain at least one number and special character.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address format' });
    return;
  }

  const db = readDb();

  // Check unique username and email
  const existingUsername = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    res.status(400).json({ error: 'Username is already registered' });
    return;
  }

  const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    res.status(400).json({ error: 'Email address is already registered' });
    return;
  }

  // Hash password
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: generateId('user'),
    username,
    email,
    passwordHash,
    fullName,
    phoneNumber: phoneNumber || '',
    avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
    bio: bio || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  // Generate token
  const token = jwt.sign({ userId: newUser.id, username: newUser.username, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
    }
  });
});

// Login
app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email/username or password' });
    return;
  }

  const token = jwt.sign({ userId: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    }
  });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response): void => {
  res.json({ message: 'Logout successful' });
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user?.userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    valid: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    }
  });
});


// ---------------- USERS API ----------------

// Get user profile
app.get('/api/users/profile', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user?.userId);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// Update user profile
app.put('/api/users/profile', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { fullName, phoneNumber, avatarUrl, bio } = req.body;

  if (!fullName) {
    res.status(400).json({ error: 'Full name is required' });
    return;
  }

  const db = readDb();
  const userIndex = db.users.findIndex(u => u.id === req.user?.userId);

  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  db.users[userIndex] = {
    ...db.users[userIndex],
    fullName,
    phoneNumber: phoneNumber !== undefined ? phoneNumber : db.users[userIndex].phoneNumber,
    avatarUrl: avatarUrl !== undefined ? avatarUrl : db.users[userIndex].avatarUrl,
    bio: bio !== undefined ? bio : db.users[userIndex].bio,
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: db.users[userIndex].id,
      username: db.users[userIndex].username,
      email: db.users[userIndex].email,
      fullName: db.users[userIndex].fullName,
      phoneNumber: db.users[userIndex].phoneNumber,
      avatarUrl: db.users[userIndex].avatarUrl,
      bio: db.users[userIndex].bio,
    }
  });
});

// Change password
app.put('/api/users/password', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required' });
    return;
  }

  if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
    res.status(400).json({ error: 'New password must be at least 8 characters long and contain at least one number and special character.' });
    return;
  }

  const db = readDb();
  const userIndex = db.users.findIndex(u => u.id === req.user?.userId);

  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const user = db.users[userIndex];

  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    res.status(400).json({ error: 'Incorrect current password' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  db.users[userIndex].passwordHash = bcrypt.hashSync(newPassword, salt);
  db.users[userIndex].updatedAt = new Date().toISOString();

  writeDb(db);

  res.json({ message: 'Password changed successfully' });
});


// ---------------- PROPERTIES API ----------------

// Get all properties (public, with filters and sorting)
app.get('/api/properties', (req: Request, res: Response): void => {
  const db = readDb();
  let result = db.properties.filter(p => !p.isDeleted);

  const { search, propertyType, status, minPrice, maxPrice, bedrooms, sortBy } = req.query;

  // Search by title or location (city/country/address)
  if (search) {
    const searchStr = String(search).toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(searchStr) ||
      p.description.toLowerCase().includes(searchStr) ||
      p.location.city.toLowerCase().includes(searchStr) ||
      p.location.country.toLowerCase().includes(searchStr) ||
      (p.location.address && p.location.address.toLowerCase().includes(searchStr))
    );
  }

  // Filter by propertyType
  if (propertyType && propertyType !== 'All') {
    result = result.filter(p => p.propertyType === propertyType);
  }

  // Filter by status (For Rent / For Sale)
  if (status && status !== 'All') {
    result = result.filter(p => p.status === status);
  }

  // Filter by price range
  if (minPrice) {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) {
      result = result.filter(p => p.price >= min);
    }
  }
  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) {
      result = result.filter(p => p.price <= max);
    }
  }

  // Filter by bedrooms
  if (bedrooms && bedrooms !== 'Any') {
    const beds = parseInt(String(bedrooms), 10);
    if (!isNaN(beds)) {
      result = result.filter(p => p.bedrooms === beds);
    }
  }

  // Sorting
  if (sortBy) {
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
  } else {
    // Default newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json(result);
});

// Get user properties (My Listings)
app.get('/api/properties/user', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const userProperties = db.properties.filter(p => p.userId === req.user?.userId && !p.isDeleted);
  res.json(userProperties);
});

// Get single property
app.get('/api/properties/:id', (req: Request, res: Response): void => {
  const db = readDb();
  const property = db.properties.find(p => p.id === req.params.id);

  if (!property || property.isDeleted) {
    res.status(404).json({ error: 'Property listing not found' });
    return;
  }

  // Add listing owner info for contact display
  const owner = db.users.find(u => u.id === property.userId);
  const ownerDetails = owner ? {
    fullName: owner.fullName,
    phoneNumber: owner.phoneNumber,
    avatarUrl: owner.avatarUrl,
    email: owner.email,
  } : null;

  res.json({
    ...property,
    owner: ownerDetails
  });
});

// Create property
app.post('/api/properties', authenticateToken, (req: AuthRequest, res: Response): void => {
  const { title, description, price, location, propertyType, bedrooms, bathrooms, area, imageUrls, status } = req.body;

  if (!title || !description || !price || !location || !location.city || !location.country || !propertyType || !status) {
    res.status(400).json({ error: 'Missing required property details' });
    return;
  }

  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    res.status(400).json({ error: 'Price must be a positive number' });
    return;
  }

  if (title.length > 100) {
    res.status(400).json({ error: 'Title must be 100 characters or less' });
    return;
  }

  if (description.length > 2000) {
    res.status(400).json({ error: 'Description must be 2000 characters or less' });
    return;
  }

  const db = readDb();

  // Create default fallback image if empty
  const defaultImagesMap: Record<string, string> = {
    Apartment: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600',
    House: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
    Studio: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=600',
    Villa: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=600',
    Commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
  };

  const finalImageUrls = Array.isArray(imageUrls) && imageUrls.filter(u => u.trim() !== '').length > 0
    ? imageUrls.slice(0, 5)
    : [defaultImagesMap[propertyType] || defaultImagesMap.Apartment];

  const newProperty: Property = {
    id: generateId('prop'),
    title,
    description,
    price: numPrice,
    location: {
      city: location.city,
      country: location.country,
      address: location.address || '',
    },
    propertyType,
    bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
    bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
    area: area ? parseFloat(area) : undefined,
    imageUrls: finalImageUrls,
    status,
    userId: req.user!.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
  };

  db.properties.push(newProperty);
  writeDb(db);

  res.status(201).json({
    message: 'Property listing created successfully',
    property: newProperty,
  });
});

// Update property
app.put('/api/properties/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const propertyIndex = db.properties.findIndex(p => p.id === req.params.id && !p.isDeleted);

  if (propertyIndex === -1) {
    res.status(404).json({ error: 'Property listing not found' });
    return;
  }

  const property = db.properties[propertyIndex];

  // Verify ownership
  if (property.userId !== req.user?.userId) {
    res.status(403).json({ error: 'Unauthorized: You are not the owner of this property listing' });
    return;
  }

  const { title, description, price, location, propertyType, bedrooms, bathrooms, area, imageUrls, status } = req.body;

  if (title && title.length > 100) {
    res.status(400).json({ error: 'Title must be 100 characters or less' });
    return;
  }

  if (description && description.length > 2000) {
    res.status(400).json({ error: 'Description must be 2000 characters or less' });
    return;
  }

  if (price !== undefined) {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ error: 'Price must be a positive number' });
      return;
    }
    db.properties[propertyIndex].price = numPrice;
  }

  if (title) db.properties[propertyIndex].title = title;
  if (description) db.properties[propertyIndex].description = description;
  if (propertyType) db.properties[propertyIndex].propertyType = propertyType;
  if (status) db.properties[propertyIndex].status = status;

  if (location) {
    db.properties[propertyIndex].location = {
      city: location.city || db.properties[propertyIndex].location.city,
      country: location.country || db.properties[propertyIndex].location.country,
      address: location.address !== undefined ? location.address : db.properties[propertyIndex].location.address,
    };
  }

  if (bedrooms !== undefined) db.properties[propertyIndex].bedrooms = bedrooms ? parseInt(bedrooms, 10) : undefined;
  if (bathrooms !== undefined) db.properties[propertyIndex].bathrooms = bathrooms ? parseFloat(bathrooms) : undefined;
  if (area !== undefined) db.properties[propertyIndex].area = area ? parseFloat(area) : undefined;
  if (imageUrls !== undefined) {
    db.properties[propertyIndex].imageUrls = Array.isArray(imageUrls) && imageUrls.filter(u => u.trim() !== '').length > 0
      ? imageUrls.slice(0, 5)
      : db.properties[propertyIndex].imageUrls;
  }

  db.properties[propertyIndex].updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({
    message: 'Property listing updated successfully',
    property: db.properties[propertyIndex],
  });
});

// Delete property (soft delete)
app.delete('/api/properties/:id', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const propertyIndex = db.properties.findIndex(p => p.id === req.params.id && !p.isDeleted);

  if (propertyIndex === -1) {
    res.status(404).json({ error: 'Property listing not found' });
    return;
  }

  const property = db.properties[propertyIndex];

  // Verify ownership
  if (property.userId !== req.user?.userId) {
    res.status(403).json({ error: 'Unauthorized: You are not the owner of this property listing' });
    return;
  }

  // Mark as deleted
  db.properties[propertyIndex].isDeleted = true;
  db.properties[propertyIndex].updatedAt = new Date().toISOString();
  writeDb(db);

  res.json({ message: 'Property listing deleted successfully' });
});


// ---------------- FAVORITES API ----------------

// Get user favorites
app.get('/api/favorites', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const userFavs = db.favorites.filter(f => f.userId === req.user?.userId);
  const favProperties = db.properties.filter(p => !p.isDeleted && userFavs.some(f => f.propertyId === p.id));
  res.json(favProperties);
});

// Toggle favorite
app.post('/api/favorites/:propertyId', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb();
  const propertyId = req.params.propertyId;
  const userId = req.user!.userId;

  const property = db.properties.find(p => p.id === propertyId && !p.isDeleted);
  if (!property) {
    res.status(404).json({ error: 'Property listing not found' });
    return;
  }

  const existingFavIndex = db.favorites.findIndex(f => f.userId === userId && f.propertyId === propertyId);
  let favorited = false;

  if (existingFavIndex > -1) {
    db.favorites.splice(existingFavIndex, 1);
  } else {
    const newFav: Favorite = {
      id: generateId('fav'),
      userId,
      propertyId,
      createdAt: new Date().toISOString()
    };
    db.favorites.push(newFav);
    favorited = true;
  }

  writeDb(db);
  res.json({ favorited, propertyId });
});


// ---------------- CONTACT & MESSAGES API ----------------

// Contact agent/owner
app.post('/api/properties/:id/contact', (req: Request, res: Response): void => {
  const { senderName, senderEmail, senderPhone, messageText, senderId } = req.body;

  if (!senderName || !senderEmail || !messageText) {
    res.status(400).json({ error: 'Name, email, and message are required fields' });
    return;
  }

  const db = readDb();
  const property = db.properties.find(p => p.id === req.params.id && !p.isDeleted);

  if (!property) {
    res.status(404).json({ error: 'Property listing not found' });
    return;
  }

  const rawDbInstance = db as any;
  if (!rawDbInstance.messages) {
    rawDbInstance.messages = [];
  }

  const newMessage: Message = {
    id: generateId('msg'),
    propertyId: property.id,
    propertyTitle: property.title,
    senderName,
    senderEmail,
    senderPhone: senderPhone || '',
    messageText,
    ownerId: property.userId,
    senderId: senderId || undefined,
    createdAt: new Date().toISOString()
  };

  rawDbInstance.messages.push(newMessage);
  writeDb(rawDbInstance);

  res.status(201).json({ message: 'Message sent successfully to the listing owner' });
});

// Get user messages
app.get('/api/messages', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb() as any;
  const messages = db.messages || [];

  // Filter messages where user is the owner of the listing
  const receivedMessages = messages.filter((m: Message) => m.ownerId === req.user?.userId);
  res.json(receivedMessages);
});


// ---------------- DASHBOARD ANALYTICS API ----------------

// Get analytics stats for owner dashboard
app.get('/api/analytics', authenticateToken, (req: AuthRequest, res: Response): void => {
  const db = readDb() as any;
  const userId = req.user!.userId;

  const allActiveProperties = db.properties.filter((p: any) => !p.isDeleted);
  const myProperties = allActiveProperties.filter((p: any) => p.userId === userId);

  // Stats calculation
  const stats = {
    myTotalListings: myProperties.length,
    myRentalsCount: myProperties.filter((p: any) => p.status === 'For Rent').length,
    mySalesCount: myProperties.filter((p: any) => p.status === 'For Sale').length,

    // Favorites metric (how many times user's properties are favorited)
    totalLikesOnMyProperties: db.favorites.filter((f: any) =>
      myProperties.some((p: any) => p.id === f.propertyId)
    ).length,

    // Received messages count
    receivedMessagesCount: (db.messages || []).filter((m: any) => m.ownerId === userId).length,

    // Data for charts
    propertiesByType: [
      { name: 'Apartment', count: myProperties.filter((p: any) => p.propertyType === 'Apartment').length },
      { name: 'House', count: myProperties.filter((p: any) => p.propertyType === 'House').length },
      { name: 'Studio', count: myProperties.filter((p: any) => p.propertyType === 'Studio').length },
      { name: 'Villa', count: myProperties.filter((p: any) => p.propertyType === 'Villa').length },
      { name: 'Commercial', count: myProperties.filter((p: any) => p.propertyType === 'Commercial').length },
    ].filter(item => item.count > 0),

    marketDistribution: [
      { name: 'For Rent', value: myProperties.filter((p: any) => p.status === 'For Rent').length },
      { name: 'For Sale', value: myProperties.filter((p: any) => p.status === 'For Sale').length },
    ].filter(item => item.value > 0),

    cityDistribution: myProperties.reduce((acc: any[], p: any) => {
      const city = p.location.city;
      const existing = acc.find(item => item.name === city);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: city, value: 1 });
      }
      return acc;
    }, [])
  };

  res.json(stats);
});


// ---------------- VITE & STATIC FILES SERVING ----------------

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PropSpace server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
