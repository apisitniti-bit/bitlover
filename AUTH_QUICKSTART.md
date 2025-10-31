# Quick Start - Authentication System

## 🚀 Already Implemented!

Your Bit-Lover application **already has a complete authentication system** with:

✅ User Registration (`/register`)  
✅ User Login (`/login`)  
✅ JWT-based Sessions  
✅ Password Hashing (bcrypt)  
✅ Protected Routes  
✅ Logout Functionality  

---

## 📍 Access Points

### Frontend URLs
- **Landing Page**: http://10.144.133.85:8080/
- **Register**: http://10.144.133.85:8080/register
- **Login**: http://10.144.133.85:8080/login
- **Dashboard**: http://10.144.133.85:8080/dashboard (requires login)

### Demo Account
```
Email: demo@bitlover.app
Password: demo123
```

---

## 🔧 What Was Just Updated

### 1. UserProfile Component Enhancement
**File**: `src/components/UserProfile.tsx`

**Changes:**
- ✅ Now displays **real user data** from AuthContext (not mock data)
- ✅ Added **dropdown menu** with Profile, Settings, and Logout options
- ✅ Logout button redirects to `/login` and clears session
- ✅ Shows user initials in avatar badge

### 2. Landing Page Auto-Redirect
**File**: `src/pages/Landing.tsx`

**Changes:**
- ✅ Automatically redirects authenticated users to `/dashboard`
- ✅ Prevents logged-in users from seeing landing page

---

## 📖 How to Use

### Register New Account

1. Navigate to http://10.144.133.85:8080/register
2. Fill in:
   - Name (e.g., "John Doe")
   - Email (e.g., "john@example.com")
   - Password (minimum 6 characters)
   - Confirm Password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to dashboard

### Login

1. Navigate to http://10.144.133.85:8080/login
2. Enter email and password
3. Click "Login"
4. Redirected to dashboard

### Logout

1. Click on your profile in the top-right corner
2. Select "Logout" from dropdown menu
3. Redirected to login page
4. Session cleared

---

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiration
- **Protected Routes**: Dashboard requires authentication
- **Auto-Redirect**: 
  - Unauthenticated users → `/login`
  - Authenticated users on landing → `/dashboard`
- **Form Validation**:
  - Email format check
  - Password minimum 6 characters
  - Password confirmation match
  - Duplicate email prevention

---

## 🗄️ Database

### User Table Schema
```
id: UUID (primary key)
email: String (unique)
password: String (bcrypt hashed)
name: String
createdAt: DateTime
updatedAt: DateTime
```

### View Users in Database
```bash
cd backend
node node_modules\ts-node\dist\bin.js -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  console.table(users.map(u => ({
    name: u.name,
    email: u.email,
    created: u.createdAt
  })));
  prisma.\$disconnect();
});
"
```

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@bitlover.app",
    "password": "demo123"
  }'
```

### Test Protected Route
```bash
# First, get token from login response
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📁 File Structure

### Backend
```
backend/
├── prisma/
│   └── schema.prisma           # User & UserSettings models
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts  # Register, login, profile endpoints
│   ├── middleware/
│   │   └── auth.middleware.ts  # JWT verification
│   ├── routes/
│   │   └── auth.routes.ts      # /api/auth/* routes
│   └── utils/
│       ├── password.utils.ts   # bcrypt hashing
│       └── jwt.utils.ts        # JWT generation/verification
└── bitlover.db                 # SQLite database
```

### Frontend
```
src/
├── contexts/
│   └── AuthContext.tsx         # Global auth state management
├── services/
│   └── auth.service.ts         # API calls for auth
├── components/
│   ├── ProtectedRoute.tsx      # Route guard component
│   └── UserProfile.tsx         # User dropdown with logout
└── pages/
    ├── auth/
    │   ├── Login.tsx           # Login form
    │   └── Register.tsx        # Registration form
    └── Landing.tsx             # Homepage with auto-redirect
```

---

## 🛠️ API Endpoints

### Public Endpoints (No Authentication)

#### Register
```
POST /api/auth/register
Body: { email, password, name }
Response: { token, user, message }
```

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { token, user, message }
```

### Protected Endpoints (Require JWT Token)

#### Get Profile
```
GET /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: { id, email, name, createdAt, userSettings }
```

#### Update Profile
```
PUT /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Body: { name?, theme?, currency?, notifications? }
Response: { message, user }
```

---

## 🔗 Integration with Other Features

### All Transaction Endpoints Protected
```typescript
// Example: Creating a transaction requires authentication
POST /api/transactions
Headers: { Authorization: "Bearer <token>" }

// userId automatically extracted from JWT by authenticate middleware
```

### Portfolio System
```typescript
// User's portfolios
GET /api/portfolios
Headers: { Authorization: "Bearer <token>" }

// Returns only portfolios belonging to authenticated user
```

### Watchlist & Alerts
```typescript
// User-specific watchlists
GET /api/watchlists
Headers: { Authorization: "Bearer <token>" }

// User-specific price alerts
GET /api/alerts
Headers: { Authorization: "Bearer <token>" }
```

---

## ⚡ Quick Commands

### Start Backend Server
```powershell
cd backend
npm run dev
```

### Start Frontend Server
```powershell
cd c:\Users\apisit.nit\Code\bitlover-2
npm run dev
```

### Reset Database (Clear All Users)
```powershell
cd backend
node node_modules\ts-node\dist\bin.js clear-all-data.ts
```

### Create Demo User
```powershell
cd backend
npx prisma db seed
```

---

## 🐛 Troubleshooting

### Issue: "User already exists"
**Solution**: Email is already registered. Use different email or login.

### Issue: Can't login with demo account
**Solution**: Ensure database is seeded:
```powershell
cd backend
npx prisma db seed
```

### Issue: Redirected to login after refresh
**Solution**: Check browser localStorage for `token` and `user`. If missing, token expired (7 days) or was cleared.

### Issue: Profile dropdown not showing user data
**Solution**: 
1. Check browser console for errors
2. Verify token in localStorage: `localStorage.getItem('token')`
3. Verify user in localStorage: `localStorage.getItem('user')`

### Issue: 401 Unauthorized on protected routes
**Solution**: Token missing or invalid. Logout and login again.

---

## 📚 Full Documentation

For comprehensive documentation, see:
- **AUTH_GUIDE.md** - Complete authentication system guide with architecture, security, and advanced topics

---

## ✨ Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| User Registration | ✅ Complete | Create account with email/password |
| User Login | ✅ Complete | JWT-based authentication |
| Password Hashing | ✅ Complete | bcrypt (10 salt rounds) |
| Protected Routes | ✅ Complete | Dashboard requires authentication |
| Session Persistence | ✅ Complete | JWT stored in localStorage |
| Auto-Redirect | ✅ Complete | Authenticated users → dashboard |
| Logout | ✅ Complete | Clear session and redirect |
| Profile Management | ✅ Complete | View and update user profile |
| Error Handling | ✅ Complete | Validation and error messages |
| Demo Account | ✅ Complete | Pre-seeded demo user |

---

## 🎯 Next Steps

Your authentication system is **fully functional**! You can now:

1. **Test the system**: Register a new account and explore
2. **Customize**: Modify styles, add more fields, etc.
3. **Enhance**: Add features like email verification, password reset, OAuth
4. **Deploy**: Configure for production with secure JWT secret

---

**Ready to go!** 🚀

Navigate to http://10.144.133.85:8080/ and start using the authentication system.
