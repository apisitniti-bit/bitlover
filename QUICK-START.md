# 🚀 Quick Start Guide - Real-Time Crypto Price Sync

## Start Backend Server

Open a terminal and run **ONE** of these commands:

### Option 1: Batch Script (Easiest)
```powershell
.\backend\start-server.bat
```

### Option 2: Direct Command
```powershell
cd backend
node node_modules\ts-node\dist\bin.js src\server.ts
```

### Option 3: NPM (if scripts are enabled)
```powershell
cd backend
npm run dev
```

---

## Expected Output

You should see:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
🚀 Starting price sync service...
✅ [2025-10-31T04:30:00.000Z] Synced 15/15 coins in 250ms
✅ Price sync service started (interval: 10s)
```

Then every 10 seconds:
```
✅ [2025-10-31T04:30:10.000Z] Synced 15/15 coins in 245ms
✅ [2025-10-31T04:30:20.000Z] Synced 15/15 coins in 230ms
```

---

## Start Frontend

In a **new terminal**:
```powershell
npm run dev
```

---

## Test the System

### ⚠️ Important: Login Required!

The Market page requires authentication. Follow these steps:

1. **Open the login page:** `http://10.144.133.85:8080/login`

2. **Login with demo account:**
   - Email: `demo@bitlover.app`
   - Password: `demo123`

3. **After login, access Market:** `http://10.144.133.85:8080/dashboard/market`

4. You should see:
   - ✅ Real cryptocurrency prices
   - ✅ "Updated at HH:MM:SS" timestamp
   - ✅ Automatic refresh every 10 seconds
   - ✅ 15 major cryptocurrencies listed

5. Watch the timestamp - it should update every 10 seconds with fresh data!

---

## Verify Everything Works

### ✅ Backend Checklist:
- [ ] Server starts without errors
- [ ] See "Starting price sync service..." message
- [ ] See sync logs every 10 seconds
- [ ] Logs show "Synced 15/15 coins"

### ✅ Frontend Checklist:
- [ ] Market page loads
- [ ] Prices are displayed (not "Loading...")
- [ ] "Updated at" time shows
- [ ] Time updates every 10 seconds
- [ ] Can filter by all/gainers/losers

---

## Troubleshooting

### Backend won't start?
- Make sure you're in the `bitlover-2` directory
- Try the direct command (Option 2)
- Check if port 3001 is already in use

### No sync logs appearing?
- Wait 10 seconds for first sync
- Check internet connection
- Look for error messages in console

### Frontend shows "Loading..." forever?
- Verify backend is running on port 3001
- Check browser console for errors
- Ensure `VITE_API_BASE_URL` in `.env` is correct

---

## What's Happening Behind the Scenes

1. **Backend** fetches prices from CoinGecko every 10 seconds
2. **Database** stores the latest prices in `MarketPrice` table
3. **Frontend** queries `/api/market/live` every 10 seconds
4. **Page** auto-updates with fresh data

---

## Need More Help?

See detailed guides:
- `REAL-TIME-SYNC-GUIDE.md` - Complete setup guide
- `IMPLEMENTATION-SUMMARY.md` - Technical details

---

**🎉 Enjoy your real-time crypto price tracking!**
