# Real-Time Crypto Price Sync - Setup Guide

## What's New

Your Bit-Lover project now has **automatic real-time cryptocurrency price syncing** from CoinGecko! 🚀

### Features Added:
- ✅ **Auto-sync every 10 seconds** from CoinGecko API
- ✅ **15 major cryptocurrencies** tracked (BTC, ETH, SOL, BNB, etc.)
- ✅ **Database storage** for fast retrieval
- ✅ **Live market page** that auto-refreshes
- ✅ **Timestamped updates** with sync logging

---

## Database Changes

### New Tables:

1. **CoinList** - Stores supported cryptocurrencies
   - `coinId` (CoinGecko ID like 'bitcoin', 'ethereum')
   - `symbol` (BTC, ETH, etc.)
   - `name` (Bitcoin, Ethereum, etc.)
   - `isActive` (enable/disable tracking)

2. **MarketPrice** - Stores real-time price data
   - `currentPrice` (USD price)
   - `marketCap` (Total market cap)
   - `volume24h` (24-hour trading volume)
   - `priceChange24h` (24-hour price change)
   - `priceChangePerc24h` (24-hour percentage change)
   - `lastUpdated` (Timestamp of last sync)

---

## How to Start the System

### Step 1: Database is Ready ✅
The migration and seeding are already complete with 15 coins loaded.

### Step 2: Start Backend Server

**Option A - Using npm (if script execution is enabled):**
```powershell
cd backend
npm run dev
```

**Option B - Direct execution:**
```powershell
cd backend
node node_modules\ts-node\dist\bin.js src\server.ts
```

**Option C - Using the batch file:**
```powershell
.\backend\start-server.bat
```

### Step 3: Verify Price Sync is Running

Once the server starts, you should see:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
🔗 Health check: http://localhost:3001/health
🚀 Starting price sync service...
✅ [2025-10-31T04:30:00.000Z] Synced 15/15 coins in 250ms
✅ Price sync service started (interval: 10s)
```

Every 10 seconds, you'll see a new sync log:
```
✅ [2025-10-31T04:30:10.000Z] Synced 15/15 coins in 230ms
✅ [2025-10-31T04:30:20.000Z] Synced 15/15 coins in 245ms
```

### Step 4: Start Frontend

In a separate terminal:
```powershell
npm run dev
```

The frontend will run on `http://localhost:8080` or `http://10.144.133.85:8080`

---

## Testing the Live Market Page

1. Open your browser to: `http://10.144.133.85:8080/dashboard/market`

2. You should see:
   - ✅ Real prices from the database
   - ✅ "Updated at HH:MM:SS" timestamp
   - ✅ Auto-refresh every 10 seconds
   - ✅ Market cap and volume data
   - ✅ 24-hour price changes

3. Watch the "Updated at" time change every 10 seconds as fresh data loads

---

## API Endpoints

### New Endpoint: Get Live Market Prices
```
GET /api/market/live
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "lastUpdated": "2025-10-31T04:30:00.000Z",
  "data": [
    {
      "id": "uuid",
      "coinId": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "currentPrice": 68500.50,
      "marketCap": 1340000000000,
      "volume24h": 28000000000,
      "priceChange24h": 1250.75,
      "priceChangePerc24h": 1.86,
      "lastUpdated": "2025-10-31T04:30:00.000Z"
    },
    // ... more coins
  ]
}
```

---

## Architecture

```
┌─────────────────┐
│  CoinGecko API  │ (External source)
└────────┬────────┘
         │ Fetch every 10s
         ▼
┌─────────────────┐
│ PriceSyncService│ (Backend service)
└────────┬────────┘
         │ Upsert prices
         ▼
┌─────────────────┐
│ MarketPrice DB  │ (SQLite table)
└────────┬────────┘
         │ Query data
         ▼
┌─────────────────┐
│ /api/market/live│ (REST endpoint)
└────────┬────────┘
         │ HTTP GET
         ▼
┌─────────────────┐
│  Market Page    │ (Frontend auto-refresh)
└─────────────────┘
```

---

## Configuration

The price sync service is configured in:
- **Service:** `backend/src/services/price-sync.service.ts`
- **Interval:** 10 seconds (configurable via `SYNC_INTERVAL_MS`)
- **API:** CoinGecko free tier
- **Coins tracked:** All active coins in `CoinList` table

---

## Adding More Coins

To track additional cryptocurrencies:

1. Find the CoinGecko ID (e.g., 'cardano', 'polkadot')
2. Add to database:
```sql
INSERT INTO CoinList (id, coinId, symbol, name, isActive)
VALUES (
  'uuid-here',
  'cardano',
  'ADA',
  'Cardano',
  true
);
```

3. The next sync (within 10 seconds) will automatically fetch prices

---

## Troubleshooting

### Sync not working?
- Check server logs for error messages
- Verify internet connection to CoinGecko API
- Check rate limits (free tier: 10-50 calls/minute)

### Prices not updating on frontend?
- Check browser console for errors
- Verify `VITE_API_BASE_URL` in `.env`
- Ensure backend is accessible from frontend

### Empty market page?
- Ensure backend server is running
- Check that coin seeding completed successfully
- Wait 10 seconds for first sync to complete

---

## Performance Notes

- **API Calls:** 1 call per 10 seconds (within free tier limits)
- **Database Operations:** Bulk upsert with Promise.all
- **Caching:** Data stored in database, no need for additional cache
- **Frontend Load:** Minimal - fetches pre-processed data from DB

---

## Next Steps

Want to enhance further? Consider:

1. **Add WebSocket support** for instant updates without polling
2. **Implement historical data storage** for charting
3. **Add price alerts** that trigger when thresholds are met
4. **Create admin panel** to manage CoinList entries
5. **Add more data points** (ATH, ATL, circulating supply, etc.)

---

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations completed successfully
4. Review the troubleshooting section above

Enjoy your real-time crypto tracking! 🎉📈
