import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface CoinGeckoPriceData {
  [key: string]: {
    usd: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
  };
}

/**
 * Price Sync Service - Syncs cryptocurrency prices from CoinGecko every 10 seconds
 */
export class PriceSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 10000; // 10 seconds
  private readonly COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
  private isRunning = false;

  /**
   * Start the price sync service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Price sync service is already running');
      return;
    }

    console.log('🚀 Starting price sync service...');
    this.isRunning = true;

    // Run immediately on start
    await this.syncPrices();

    // Then run every 10 seconds
    this.syncInterval = setInterval(async () => {
      await this.syncPrices();
    }, this.SYNC_INTERVAL_MS);

    console.log(`✅ Price sync service started (interval: ${this.SYNC_INTERVAL_MS / 1000}s)`);
  }

  /**
   * Stop the price sync service
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.isRunning = false;
      console.log('🛑 Price sync service stopped');
    }
  }

  /**
   * Sync prices from CoinGecko API
   */
  private async syncPrices(): Promise<void> {
    const startTime = Date.now();

    try {
      // Get all active coins from the database
      const coins = await prisma.coinList.findMany({
        where: { isActive: true },
        select: { coinId: true, symbol: true, name: true },
      });

      if (coins.length === 0) {
        console.log('⚠️  No active coins found in CoinList table');
        return;
      }

      // Build comma-separated list of coin IDs for CoinGecko API
      const coinIds = coins.map((c) => c.coinId).join(',');

      // Fetch prices from CoinGecko
      const url = `${this.COINGECKO_API_BASE}/simple/price`;
      const params = {
        ids: coinIds,
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_vol: true,
        include_24hr_change: true,
      };

      const response = await axios.get<CoinGeckoPriceData>(url, { params });
      const priceData = response.data;

      // Update database with new prices
      let updatedCount = 0;
      const updatePromises = coins.map(async (coin) => {
        const data = priceData[coin.coinId];
        if (data && data.usd) {
          await prisma.marketPrice.upsert({
            where: { coinId: coin.coinId },
            update: {
              currentPrice: data.usd,
              marketCap: data.usd_market_cap || null,
              volume24h: data.usd_24h_vol || null,
              priceChange24h: data.usd_24h_change || null,
              priceChangePerc24h: data.usd_24h_change || null,
              lastUpdated: new Date(),
            },
            create: {
              coinId: coin.coinId,
              symbol: coin.symbol,
              name: coin.name,
              currentPrice: data.usd,
              marketCap: data.usd_market_cap || null,
              volume24h: data.usd_24h_vol || null,
              priceChange24h: data.usd_24h_change || null,
              priceChangePerc24h: data.usd_24h_change || null,
              lastUpdated: new Date(),
            },
          });
          updatedCount++;
        }
      });

      await Promise.all(updatePromises);

      const duration = Date.now() - startTime;
      const timestamp = new Date().toISOString();

      console.log(
        `✅ [${timestamp}] Synced ${updatedCount}/${coins.length} coins in ${duration}ms`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Price sync failed (API error):', error.message);
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
        }
      } else {
        console.error('❌ Price sync failed:', error);
      }
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.SYNC_INTERVAL_MS,
    };
  }
}

// Create singleton instance
export const priceSyncService = new PriceSyncService();
