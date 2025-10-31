import { Request, Response } from 'express';
import { prisma } from '../server';
import { cryptoService } from '../services/crypto.service';

export const portfolioController = {
  // Get all user portfolios
  async getAllPortfolios(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          assets: true,
          _count: {
            select: { assets: true, transactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(portfolios);
    } catch (error) {
      console.error('Get portfolios error:', error);
      res.status(500).json({ error: 'Failed to fetch portfolios' });
    }
  },

  // Get single portfolio
  async getPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
        include: {
          assets: true,
          transactions: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
        },
      });

      if (!portfolio) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }

      res.json(portfolio);
    } catch (error) {
      console.error('Get portfolio error:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
  },

  // Create new portfolio
  async createPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { name, description } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!name) {
        res.status(400).json({ error: 'Portfolio name is required' });
        return;
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name,
          description: description || null,
        },
      });

      res.status(201).json({
        message: 'Portfolio created successfully',
        portfolio,
      });
    } catch (error) {
      console.error('Create portfolio error:', error);
      res.status(500).json({ error: 'Failed to create portfolio' });
    }
  },

  // Update portfolio
  async updatePortfolio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { name, description } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check ownership
      const existing = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }

      const portfolio = await prisma.portfolio.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
      });

      res.json({
        message: 'Portfolio updated successfully',
        portfolio,
      });
    } catch (error) {
      console.error('Update portfolio error:', error);
      res.status(500).json({ error: 'Failed to update portfolio' });
    }
  },

  // Delete portfolio
  async deletePortfolio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check ownership
      const existing = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }

      await prisma.portfolio.delete({ where: { id } });

      res.json({ message: 'Portfolio deleted successfully' });
    } catch (error) {
      console.error('Delete portfolio error:', error);
      res.status(500).json({ error: 'Failed to delete portfolio' });
    }
  },

  // Get portfolio summary with live prices
  async getPortfolioSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
        include: {
          assets: true,
        },
      });

      if (!portfolio) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }

      // Get live prices for all assets
      const symbols = [...new Set(portfolio.assets.map(a => a.symbol))];
      const prices = await cryptoService.getPrices(symbols);
      
      const priceMap = new Map(prices.map(p => [p.symbol, p]));

      // Calculate portfolio values
      let totalValue = 0;
      let totalCost = 0;
      let totalChange24h = 0;

      const assetsWithPrices = portfolio.assets.map(asset => {
        const priceData = priceMap.get(asset.symbol);
        const currentPrice = priceData?.current_price || 0;
        const currentValue = asset.quantity * currentPrice;
        const costBasis = asset.quantity * asset.purchasePrice;
        const profitLoss = currentValue - costBasis;
        const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

        totalValue += currentValue;
        totalCost += costBasis;
        
        if (priceData) {
          totalChange24h += (priceData.price_change_percentage_24h / 100) * currentValue;
        }

        return {
          ...asset,
          currentPrice,
          currentValue,
          costBasis,
          profitLoss,
          profitLossPercentage,
          change24h: priceData?.price_change_24h || 0,
          changePercentage24h: priceData?.price_change_percentage_24h || 0,
        };
      });

      const totalProfitLoss = totalValue - totalCost;
      const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
      const change24hPercentage = totalValue > 0 ? (totalChange24h / totalValue) * 100 : 0;

      res.json({
        portfolio: {
          id: portfolio.id,
          name: portfolio.name,
          description: portfolio.description,
        },
        summary: {
          totalValue,
          totalCost,
          totalProfitLoss,
          totalProfitLossPercentage,
          change24h: totalChange24h,
          change24hPercentage,
          assetCount: portfolio.assets.length,
        },
        assets: assetsWithPrices,
      });
    } catch (error) {
      console.error('Get portfolio summary error:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio summary' });
    }
  },
};
