import { Request, Response } from 'express';
import { prisma } from '../server';
import { cryptoService } from '../services/crypto.service';

export const analyticsController = {
  // Get portfolio performance over time
  async getPortfolioPerformance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's portfolios or specific portfolio
      const portfolios = portfolioId
        ? await prisma.portfolio.findMany({
            where: { id: portfolioId as string, userId },
            include: { assets: true },
          })
        : await prisma.portfolio.findMany({
            where: { userId },
            include: { assets: true },
          });

      if (portfolios.length === 0) {
        res.status(404).json({ error: 'No portfolios found' });
        return;
      }

      // Aggregate all assets
      const allAssets = portfolios.flatMap(p => p.assets);
      const symbols = [...new Set(allAssets.map(a => a.symbol))];

      // Get current prices
      const prices = await cryptoService.getPrices(symbols);
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      // Calculate current total value
      let totalCurrentValue = 0;
      let totalCostBasis = 0;

      allAssets.forEach(asset => {
        const priceData = priceMap.get(asset.symbol);
        const currentPrice = priceData?.current_price || 0;
        totalCurrentValue += asset.quantity * currentPrice;
        totalCostBasis += asset.quantity * asset.purchasePrice;
      });

      const totalProfitLoss = totalCurrentValue - totalCostBasis;
      const totalProfitLossPercentage = totalCostBasis > 0 
        ? (totalProfitLoss / totalCostBasis) * 100 
        : 0;

      res.json({
        currentValue: totalCurrentValue,
        costBasis: totalCostBasis,
        profitLoss: totalProfitLoss,
        profitLossPercentage: totalProfitLossPercentage,
        portfolioCount: portfolios.length,
        assetCount: allAssets.length,
      });
    } catch (error) {
      console.error('Get portfolio performance error:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio performance' });
    }
  },

  // Get asset allocation (diversification)
  async getAssetAllocation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's portfolios or specific portfolio
      const portfolios = portfolioId
        ? await prisma.portfolio.findMany({
            where: { id: portfolioId as string, userId },
            include: { assets: true },
          })
        : await prisma.portfolio.findMany({
            where: { userId },
            include: { assets: true },
          });

      if (portfolios.length === 0) {
        res.status(404).json({ error: 'No portfolios found' });
        return;
      }

      // Aggregate all assets
      const allAssets = portfolios.flatMap(p => p.assets);
      const symbols = [...new Set(allAssets.map(a => a.symbol))];

      // Get current prices
      const prices = await cryptoService.getPrices(symbols);
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      // Calculate allocation
      let totalValue = 0;
      const assetValues = new Map<string, { value: number; quantity: number; name: string }>();

      allAssets.forEach(asset => {
        const priceData = priceMap.get(asset.symbol);
        const currentPrice = priceData?.current_price || 0;
        const value = asset.quantity * currentPrice;
        
        totalValue += value;

        const existing = assetValues.get(asset.symbol);
        if (existing) {
          existing.value += value;
          existing.quantity += asset.quantity;
        } else {
          assetValues.set(asset.symbol, { 
            value, 
            quantity: asset.quantity,
            name: asset.name,
          });
        }
      });

      // Create allocation array with percentages
      const allocation = Array.from(assetValues.entries()).map(([symbol, data]) => ({
        symbol,
        name: data.name,
        value: data.value,
        quantity: data.quantity,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      })).sort((a, b) => b.value - a.value);

      res.json({
        totalValue,
        allocation,
      });
    } catch (error) {
      console.error('Get asset allocation error:', error);
      res.status(500).json({ error: 'Failed to fetch asset allocation' });
    }
  },

  // Get profit/loss details
  async getProfitLoss(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's portfolios or specific portfolio
      const portfolios = portfolioId
        ? await prisma.portfolio.findMany({
            where: { id: portfolioId as string, userId },
            include: { assets: true },
          })
        : await prisma.portfolio.findMany({
            where: { userId },
            include: { assets: true },
          });

      if (portfolios.length === 0) {
        res.status(404).json({ error: 'No portfolios found' });
        return;
      }

      // Aggregate all assets
      const allAssets = portfolios.flatMap(p => p.assets);
      const symbols = [...new Set(allAssets.map(a => a.symbol))];

      // Get current prices
      const prices = await cryptoService.getPrices(symbols);
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      // Calculate P&L for each asset
      const assetPnL = allAssets.map(asset => {
        const priceData = priceMap.get(asset.symbol);
        const currentPrice = priceData?.current_price || 0;
        const currentValue = asset.quantity * currentPrice;
        const costBasis = asset.quantity * asset.purchasePrice;
        const profitLoss = currentValue - costBasis;
        const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

        return {
          symbol: asset.symbol,
          name: asset.name,
          quantity: asset.quantity,
          purchasePrice: asset.purchasePrice,
          currentPrice,
          costBasis,
          currentValue,
          profitLoss,
          profitLossPercentage,
        };
      }).sort((a, b) => b.profitLoss - a.profitLoss);

      const totalCurrentValue = assetPnL.reduce((sum, asset) => sum + asset.currentValue, 0);
      const totalCostBasis = assetPnL.reduce((sum, asset) => sum + asset.costBasis, 0);
      const totalProfitLoss = totalCurrentValue - totalCostBasis;
      const totalProfitLossPercentage = totalCostBasis > 0 
        ? (totalProfitLoss / totalCostBasis) * 100 
        : 0;

      const winners = assetPnL.filter(a => a.profitLoss > 0);
      const losers = assetPnL.filter(a => a.profitLoss < 0);

      res.json({
        summary: {
          totalCurrentValue,
          totalCostBasis,
          totalProfitLoss,
          totalProfitLossPercentage,
          winnersCount: winners.length,
          losersCount: losers.length,
        },
        assets: assetPnL,
        topWinners: winners.slice(0, 5),
        topLosers: losers.slice(0, 5),
      });
    } catch (error) {
      console.error('Get profit/loss error:', error);
      res.status(500).json({ error: 'Failed to fetch profit/loss data' });
    }
  },

  // Get ROI metrics
  async getROI(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's portfolios or specific portfolio
      const portfolios = portfolioId
        ? await prisma.portfolio.findMany({
            where: { id: portfolioId as string, userId },
            include: { assets: true, transactions: true },
          })
        : await prisma.portfolio.findMany({
            where: { userId },
            include: { assets: true, transactions: true },
          });

      if (portfolios.length === 0) {
        res.status(404).json({ error: 'No portfolios found' });
        return;
      }

      // Aggregate all assets and transactions
      const allAssets = portfolios.flatMap(p => p.assets);
      const allTransactions = portfolios.flatMap(p => p.transactions);
      
      const symbols = [...new Set(allAssets.map(a => a.symbol))];

      // Get current prices
      const prices = await cryptoService.getPrices(symbols);
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      // Calculate current total value
      let totalCurrentValue = 0;
      let totalInvested = 0;

      allAssets.forEach(asset => {
        const priceData = priceMap.get(asset.symbol);
        const currentPrice = priceData?.current_price || 0;
        totalCurrentValue += asset.quantity * currentPrice;
        totalInvested += asset.quantity * asset.purchasePrice;
      });

      // Calculate fees from transactions
      const totalFees = allTransactions.reduce((sum, tx) => sum + tx.fee, 0);
      
      const roi = totalInvested > 0 
        ? ((totalCurrentValue - totalInvested - totalFees) / totalInvested) * 100 
        : 0;

      // Calculate time-weighted return (simplified)
      const oldestAsset = allAssets.reduce((oldest, asset) => {
        return !oldest || asset.purchaseDate < oldest.purchaseDate ? asset : oldest;
      }, allAssets[0]);

      const daysHeld = oldestAsset 
        ? Math.floor((Date.now() - oldestAsset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const annualizedROI = daysHeld > 0 && totalInvested > 0
        ? (roi / daysHeld) * 365
        : 0;

      res.json({
        totalInvested,
        totalCurrentValue,
        totalFees,
        netProfitLoss: totalCurrentValue - totalInvested - totalFees,
        roi,
        daysHeld,
        annualizedROI,
      });
    } catch (error) {
      console.error('Get ROI error:', error);
      res.status(500).json({ error: 'Failed to fetch ROI metrics' });
    }
  },

  // Get top holdings by value
  async getTopHoldings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId, limit = 5 } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Get user's portfolios or specific portfolio
      const portfolios = portfolioId
        ? await prisma.portfolio.findMany({
            where: { id: portfolioId as string, userId },
            include: { assets: true },
          })
        : await prisma.portfolio.findMany({
            where: { userId },
            include: { assets: true },
          });

      if (portfolios.length === 0) {
        res.json([]); // Return empty array if no portfolios
        return;
      }

      // Aggregate all assets
      const allAssets = portfolios.flatMap(p => p.assets);
      
      if (allAssets.length === 0) {
        res.json([]); // Return empty array if no assets
        return;
      }

      const symbols = [...new Set(allAssets.map(a => a.symbol))];

      // Get current prices
      const prices = await cryptoService.getPrices(symbols);
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      // Calculate value for each asset and prepare response
      const holdingsWithValue = allAssets.map(asset => {
        const priceData = priceMap.get(asset.symbol);
        const currentPrice = priceData?.current_price || 0;
        const value = asset.quantity * currentPrice;
        const priceChange24h = priceData?.price_change_percentage_24h || 0;

        return {
          symbol: asset.symbol,
          name: asset.name,
          quantity: asset.quantity,
          currentPrice,
          purchasePrice: asset.purchasePrice,
          value,
          priceChange24h,
          profitLoss: value - (asset.quantity * asset.purchasePrice),
          profitLossPercentage: asset.purchasePrice > 0 
            ? ((currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100 
            : 0,
        };
      });

      // Sort by value (descending) and limit
      const topHoldings = holdingsWithValue
        .sort((a, b) => b.value - a.value)
        .slice(0, parseInt(limit as string));

      res.json(topHoldings);
    } catch (error) {
      console.error('Get top holdings error:', error);
      res.status(500).json({ error: 'Failed to fetch top holdings' });
    }
  },
};
