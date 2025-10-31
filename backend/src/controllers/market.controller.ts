import { Request, Response } from 'express';
import { cryptoService } from '../services/crypto.service';
import { prisma } from '../server';

export const marketController = {
  // Get all market prices from database (synced in real-time)
  async getMarketPrices(_req: Request, res: Response): Promise<void> {
    try {
      const prices = await prisma.marketPrice.findMany({
        orderBy: { marketCap: 'desc' },
      });

      res.json({
        success: true,
        count: prices.length,
        lastUpdated: prices[0]?.lastUpdated || null,
        data: prices,
      });
    } catch (error) {
      console.error('Get market prices error:', error);
      res.status(500).json({ error: 'Failed to fetch market prices' });
    }
  },

  // Get current prices for multiple coins
  async getPrices(req: Request, res: Response): Promise<void> {
    try {
      const { symbols } = req.query;
      
      if (!symbols || typeof symbols !== 'string') {
        res.status(400).json({ error: 'Symbols parameter is required' });
        return;
      }

      const symbolArray = symbols.split(',').map(s => s.trim());
      const prices = await cryptoService.getPrices(symbolArray);

      res.json(prices);
    } catch (error) {
      console.error('Get prices error:', error);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  },

  // Get detailed information for a coin
  async getCoinDetail(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      
      if (!symbol) {
        res.status(400).json({ error: 'Symbol is required' });
        return;
      }

      const coinDetail = await cryptoService.getCoinDetail(symbol);

      res.json(coinDetail);
    } catch (error) {
      console.error('Get coin detail error:', error);
      res.status(500).json({ error: 'Failed to fetch coin details' });
    }
  },

  // Get top cryptocurrencies
  async getTopCoins(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const topCoins = await cryptoService.getTopCoins(limit);

      res.json(topCoins);
    } catch (error) {
      console.error('Get top coins error:', error);
      res.status(500).json({ error: 'Failed to fetch top cryptocurrencies' });
    }
  },

  // Get trending cryptocurrencies
  async getTrending(_req: Request, res: Response): Promise<void> {
    try {
      const trending = await cryptoService.getTrendingCoins();

      res.json(trending);
    } catch (error) {
      console.error('Get trending error:', error);
      res.status(500).json({ error: 'Failed to fetch trending cryptocurrencies' });
    }
  },

  // Search for cryptocurrencies
  async searchCoins(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const results = await cryptoService.searchCoins(q);

      res.json(results);
    } catch (error) {
      console.error('Search coins error:', error);
      res.status(500).json({ error: 'Failed to search cryptocurrencies' });
    }
  },

  // Get historical price data
  async getHistoricalData(req: Request, res: Response): Promise<void> {
    try {
      const { symbol } = req.params;
      const days = parseInt(req.query.days as string) || 7;
      
      if (!symbol) {
        res.status(400).json({ error: 'Symbol is required' });
        return;
      }

      const data = await cryptoService.getHistoricalData(symbol, days);

      res.json(data);
    } catch (error) {
      console.error('Get historical data error:', error);
      res.status(500).json({ error: 'Failed to fetch historical data' });
    }
  },
};
