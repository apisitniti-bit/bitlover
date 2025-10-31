# 🚀 Quick Start Guide

## Starting the BitLover System

### Method 1: Windows Batch File (Easiest)
1. **Start Backend:**
   - Double-click `START_BACKEND.bat` in project root
   - Wait for "Server running" message

2. **Start Frontend:**
   - Open new terminal
   - Run: `npm run dev`
   - Access at: http://10.144.133.85:8080/

### Method 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## Verify System is Running

### Check Backend
- URL: http://localhost:3001/health
- Expected: `{"status":"ok","timestamp":"..."}`

### Check Frontend
- URL: http://10.144.133.85:8080/
- Expected: Landing page loads

## 🧪 Quick System Test

### 1. Test Login
- Navigate to: http://10.144.133.85:8080/login
- Credentials:
  - Email: demo@bitlover.app
  - Password: demo123
- Expected: Redirects to /dashboard

### 2. Test Market Page
- Navigate to: /dashboard/market
- Expected: 100 cryptocurrencies displayed
- Test: Click any "Trade" button
- Expected: Navigates to Trade page with coin pre-selected

### 3. Test Trade Page (Sell Validation)
- Navigate to: /dashboard/trade
- Switch to "Sell" tab
- Expected: Only coins you own appear in dropdown
- Try: Enter quantity > available
- Expected: Error "Insufficient balance"

### 4. Test Error Handling
- Stop backend server
- Try to load market page
- Expected: Error message displayed (not app crash)
- Start backend again
- Expected: Page auto-recovers after retry

## 📋 What Was Fixed

✅ **12 Critical Issues Resolved:**
1. Missing balance validation (SELL transactions)
2. Unsafe number parsing
3. Generic error messages
4. No error boundary (app crashes)
5. No request timeout
6. No retry logic
7. No data validation (PriceContext)
8. No automatic retry (price loading)
9. Missing timeout (price API)
10. Created server restart script
11. Added comprehensive logging
12. Improved error responses

✅ **Zero Breaking Changes**
✅ **All Existing Features Work**
✅ **Better Security & Reliability**

## 📖 Full Documentation

See `SYSTEM_FIXES_SUMMARY.md` for complete details:
- All issues identified
- All fixes applied
- Testing procedures
- Deployment checklist
- Future recommendations

## ⚠️ Important Notes

1. **Use CMD Terminal** (not PowerShell) if you encounter encoding issues
2. **Backend must be running** before testing frontend features
3. **Check console** for detailed error logs during development

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is already in use
netstat -ano | findstr :3001

# Kill existing process
taskkill /PID <process_id> /F

# Restart
cd backend
npm run dev
```

### Frontend shows 500 errors
- Check backend is running: http://localhost:3001/health
- Check backend console for errors
- Restart backend if needed

### Price data not loading
- Check CoinGecko API rate limits
- Wait 1 minute and refresh
- Check backend console for API errors

---

**System Status:** ✅ Production Ready  
**Last Updated:** October 31, 2025  
**Version:** 1.0.0 (Post-Security-Review)
