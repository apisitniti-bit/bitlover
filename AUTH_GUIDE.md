# Authentication System Guide

## Overview
Bit-Lover implements a complete authentication system with user registration, login, JWT-based session management, and protected routes. The system uses **bcrypt** for password hashing and **JWT** for token-based authentication.

---

## 📋 Table of Contents
1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Security Features](#security-features)
8. [Testing](#testing)

---

## Architecture

### Tech Stack
- **Backend**: Node.js, Express, Prisma ORM, SQLite
- **Frontend**: React 18, TypeScript, React Router v6
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcrypt (10 salt rounds)
- **State Management**: React Context API

### Flow Diagram
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │─────▶│   React     │─────▶│   Express   │
│             │      │  AuthContext│      │  API Server │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                     │
       │                    │                     ▼
       │                    │              ┌─────────────┐
       │                    │              │   Prisma    │
       │                    │              │   (SQLite)  │
       │                    │              └─────────────┘
       │                    │
       ▼                    ▼
  localStorage         Session State
  - JWT Token         - User Object
  - User Data         - isAuthenticated
```

---

## Database Schema

### User Table
Located in: `backend/prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  portfolios   Portfolio[]
  watchlists   Watchlist[]
  priceAlerts  PriceAlert[]
  userSettings UserSettings?
}

model UserSettings {
  id            String  @id @default(uuid())
  userId        String  @unique
  theme         String  @default("dark")
  currency      String  @default("USD")
  notifications Boolean @default(true)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Fields Explanation
- **id**: UUID primary key
- **email**: Unique email address (used for login)
- **password**: bcrypt hashed password (10 salt rounds)
- **name**: User's display name
- **createdAt**: Account creation timestamp
- **updatedAt**: Last modification timestamp

---

## Backend Implementation

### 1. Password Utilities
**File**: `backend/src/utils/password.utils.ts`

```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
```

### 2. JWT Utilities
**File**: `backend/src/utils/jwt.utils.ts`

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
```

### 3. Authentication Middleware
**File**: `backend/src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### 4. Auth Controller
**File**: `backend/src/controllers/auth.controller.ts`

**Key Functions:**
- `register`: Create new user with hashed password
- `login`: Validate credentials and issue JWT
- `getProfile`: Fetch authenticated user profile
- `updateProfile`: Update user information

### 5. Auth Routes
**File**: `backend/src/routes/auth.routes.ts`

```typescript
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
```

---

## Frontend Implementation

### 1. AuthContext
**File**: `src/contexts/AuthContext.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}
```

**Features:**
- Global authentication state
- Automatic token persistence in localStorage
- Session restoration on page reload
- Loading state management

### 2. Auth Service
**File**: `src/services/auth.service.ts`

```typescript
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  async register(data: RegisterData): Promise<AuthResponse>
  async getProfile(): Promise<User>
  async updateProfile(data: Partial<User>): Promise<any>
  logout(): void
  getCurrentUser(): User | null
  getToken(): string | null
  isAuthenticated(): boolean
}
```

### 3. Protected Routes
**File**: `src/components/ProtectedRoute.tsx`

```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### 4. Login Page
**File**: `src/pages/auth/Login.tsx`

**Features:**
- Email validation
- Password field
- Loading state
- Error handling
- Demo credentials display
- Link to register page

### 5. Register Page
**File**: `src/pages/auth/Register.tsx`

**Features:**
- Name, email, password fields
- Confirm password validation
- Password length requirement (min 6 characters)
- Loading state
- Error handling
- Link to login page

### 6. User Profile Component
**File**: `src/components/UserProfile.tsx`

**Features:**
- Display authenticated user info
- Dropdown menu with logout
- Avatar with user initials
- Logout confirmation toast

---

## API Endpoints

### Base URL
```
http://localhost:3001/api/auth
```

### 1. Register User
**Endpoint**: `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Validation:**
- Email must be valid format
- Password minimum 6 characters
- Name is required
- Email must be unique

**Error Responses:**
```json
// 400 Bad Request - Duplicate email
{
  "error": "User already exists with this email"
}

// 400 Bad Request - Validation errors
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

---

### 2. Login User
**Endpoint**: `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Invalid credentials
{
  "error": "Invalid email or password"
}
```

---

### 3. Get Profile (Protected)
**Endpoint**: `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-10-31T10:00:00.000Z",
  "userSettings": {
    "theme": "dark",
    "currency": "USD",
    "notifications": true
  }
}
```

**Error Responses:**
```json
// 401 Unauthorized - Missing/invalid token
{
  "error": "Authentication required"
}

// 404 Not Found - User deleted
{
  "error": "User not found"
}
```

---

### 4. Update Profile (Protected)
**Endpoint**: `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "theme": "light",
  "currency": "EUR"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Jane Doe"
  }
}
```

---

## Usage Examples

### Frontend - Register New User

```typescript
import { useAuth } from '@/contexts/AuthContext';

const RegisterComponent = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate('/dashboard'); // Auto-redirect after registration
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Frontend - Login

```typescript
import { useAuth } from '@/contexts/AuthContext';

const LoginComponent = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // User state automatically updated in AuthContext
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
};
```

### Frontend - Access User Data

```typescript
import { useAuth } from '@/contexts/AuthContext';

const ProfileComponent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
};
```

### Frontend - Logout

```typescript
import { useAuth } from '@/contexts/AuthContext';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears localStorage and resets state
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

### Backend - Protected Endpoint

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/protected-data', authenticate, async (req, res) => {
  const userId = req.user?.userId; // From JWT payload
  
  // Fetch user-specific data
  const data = await prisma.someModel.findMany({
    where: { userId }
  });
  
  res.json(data);
});
```

---

## Security Features

### 1. Password Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 10 (2^10 = 1,024 iterations)
- **Storage**: Only hashed passwords stored in database
- **Verification**: `bcrypt.compare()` for timing-safe comparison

### 2. JWT Tokens
- **Expiration**: 7 days
- **Payload**: userId, email only (no sensitive data)
- **Secret**: Environment variable `JWT_SECRET`
- **Transmission**: Authorization header (Bearer token)

### 3. Input Validation
- **express-validator** for request validation
- Email format validation
- Password length requirements (min 6 chars)
- Required field checks

### 4. Route Protection
- Middleware-based authentication
- Token verification on protected routes
- Automatic 401 responses for unauthorized access

### 5. Error Handling
- Generic error messages to prevent information disclosure
- Detailed logging for debugging (server-side only)
- No password or token leakage in responses

### 6. CORS Configuration
- Configured in backend server
- Allows frontend origin (http://localhost:8080)
- Credentials support for cookies/tokens

---

## Testing

### Demo Account
The system includes a pre-seeded demo account:
- **Email**: `demo@bitlover.app`
- **Password**: `demo123`

### Manual Testing Steps

#### 1. Test Registration
```bash
# Using curl
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

**Expected Response:**
- Status: 201 Created
- Response includes `token` and `user` object
- User created in database with hashed password

#### 2. Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected Response:**
- Status: 200 OK
- Response includes valid JWT token

#### 3. Test Protected Route
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <your_jwt_token>"
```

**Expected Response:**
- Status: 200 OK
- User profile data returned

#### 4. Test Logout (Frontend)
1. Login to the application
2. Click on user profile dropdown
3. Click "Logout"
4. Verify redirect to `/login`
5. Verify localStorage cleared
6. Verify unable to access `/dashboard` routes

### Validation Tests

#### Valid Registration:
- ✅ Unique email
- ✅ Password >= 6 characters
- ✅ Name provided

#### Invalid Registration:
- ❌ Duplicate email → 400 "User already exists"
- ❌ Short password → 400 "Password must be at least 6 characters"
- ❌ Invalid email format → 400 "Invalid email address"
- ❌ Missing name → 400 "Name is required"

#### Valid Login:
- ✅ Correct email/password → 200 with token

#### Invalid Login:
- ❌ Wrong password → 401 "Invalid email or password"
- ❌ Non-existent email → 401 "Invalid email or password"

#### Protected Routes:
- ✅ Valid token → 200 with data
- ❌ No token → 401 "Authentication required"
- ❌ Invalid token → 401 "Invalid or expired token"
- ❌ Expired token → 401 "Invalid or expired token"

---

## Integration with Existing Features

### Transaction System
All transaction endpoints require authentication:
- `POST /api/transactions` (Create transaction)
- `GET /api/transactions/history` (View user's transactions)

**Implementation:**
```typescript
router.post('/transactions', authenticate, transactionController.create);
```

The `authenticate` middleware extracts `userId` from JWT and attaches to request.

### Portfolio System
Portfolios are user-specific:
- `GET /api/portfolios` (User's portfolios)
- `POST /api/portfolios` (Create portfolio)

Each portfolio belongs to authenticated user via `userId` foreign key.

### Watchlist & Alerts
Similar authentication pattern:
- User can only view/modify their own watchlists
- Price alerts are user-specific

---

## Troubleshooting

### Issue: "User already exists"
**Cause:** Email is already registered
**Solution:** Use different email or login with existing account

### Issue: "Invalid or expired token"
**Cause:** JWT token expired (> 7 days) or malformed
**Solution:** Login again to get new token

### Issue: Can't access dashboard after login
**Cause:** Token not stored in localStorage
**Solution:** Check browser console for errors, verify `authService.login()` stores token

### Issue: Redirect loop
**Cause:** AuthContext loading state not resolving
**Solution:** Check `isLoading` state in ProtectedRoute, ensure AuthContext initializes

### Issue: 401 on protected routes
**Cause:** Authorization header not sent
**Solution:** Verify axios interceptor adds `Authorization: Bearer <token>` header

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="file:./bitlover.db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

### Frontend (Vite)
```typescript
// src/services/api.ts
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
```

---

## Routes Summary

### Public Routes (No Authentication)
- `/` - Landing page (auto-redirects if authenticated)
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Requires Authentication)
- `/dashboard` - Overview page
- `/dashboard/wallet` - Wallet with transaction history
- `/dashboard/market` - Market prices
- `/dashboard/trade` - Trading interface

### API Routes
**Public:**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Protected:**
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/portfolios`
- `POST /api/portfolios`
- `GET /api/transactions/history`
- `POST /api/transactions`
- `GET /api/watchlists`
- `POST /api/watchlists`
- `GET /api/alerts`
- `POST /api/alerts`

---

## Next Steps

### Enhancements
1. **Email Verification**: Send confirmation email on registration
2. **Password Reset**: Forgot password flow with email token
3. **OAuth Integration**: Login with Google/GitHub
4. **2FA**: Two-factor authentication
5. **Session Management**: Active sessions page with revoke ability
6. **Rate Limiting**: Prevent brute force attacks
7. **Refresh Tokens**: Longer session duration with refresh mechanism

### Production Checklist
- [ ] Change JWT_SECRET to strong random value
- [ ] Enable HTTPS for all traffic
- [ ] Implement rate limiting (express-rate-limit)
- [ ] Add helmet.js for security headers
- [ ] Set up monitoring for auth failures
- [ ] Configure secure cookie settings
- [ ] Implement CSRF protection
- [ ] Add audit logging for auth events
- [ ] Set up database backups
- [ ] Review and update CORS settings

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in browser console
3. Check backend logs for API errors
4. Verify database schema is up to date: `npx prisma migrate dev`

---

**Last Updated**: October 31, 2025  
**Version**: 1.0.0
