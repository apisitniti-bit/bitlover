import { Request, Response } from 'express';
import { prisma } from '../server';
import { cryptoService } from '../services/crypto.service';

export const assetController = {
  // Get all assets in a portfolio
  async getAssetsByPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify portfolio ownership
      const portfolio = await prisma.portfolio.findFirst({
        where: { id: portfolioId, userId },
      });

      if (!portfolio) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }

      const assets = await prisma.asset.findMany({
        where: { portfolioId },
        orderBy: { createdAt: 'desc' },
      });

      res.json(assets);
    } catch (error) {
      console.error('Get assets error:', error);
      res.status(500).json({ error: 'Failed to fetch assets' });
    }
  },

  // Get single asset
  async getAsset(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const asset = await prisma.asset.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
        include: {
          portfolio: true,
        },
      });

      if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      res.json(asset);
    } catch (error) {
      console.error('Get asset error:', error);
      res.status(500).json({ error: 'Failed to fetch asset' });
    }
  },

  // Add asset to portfolio
  async addAsset(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId } = req.params;
      const { symbol, name, quantity, purchasePrice, purchaseDate } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify portfolio ownership
      const portfolio = await prisma.portfolio.findFirst({
        where: { id: portfolioId, userId },
      });

      if (!portfolio) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }

      // Validation
      if (!symbol || !name || quantity === undefined || purchasePrice === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate numbers
      const quantityNum = parseFloat(quantity);
      const priceNum = parseFloat(purchasePrice);

      if (isNaN(quantityNum) || quantityNum <= 0) {
        res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
        return;
      }

      if (isNaN(priceNum) || priceNum < 0) {
        res.status(400).json({ error: 'Invalid purchase price. Must be a non-negative number.' });
        return;
      }

      const asset = await prisma.asset.create({
        data: {
          portfolioId,
          symbol: symbol.toUpperCase(),
          name,
          quantity: quantityNum,
          purchasePrice: priceNum,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        },
      });

      // Create corresponding BUY transaction
      await prisma.transaction.create({
        data: {
          portfolioId,
          type: 'BUY',
          symbol: symbol.toUpperCase(),
          quantity: quantityNum,
          price: priceNum,
          timestamp: purchaseDate ? new Date(purchaseDate) : new Date(),
        },
      });

      res.status(201).json({
        message: 'Asset added successfully',
        asset,
      });
    } catch (error) {
      console.error('Add asset error:', error);
      res.status(500).json({ error: 'Failed to add asset' });
    }
  },

  // Update asset
  async updateAsset(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { quantity, purchasePrice, purchaseDate } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await prisma.asset.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      const asset = await prisma.asset.update({
        where: { id },
        data: {
          ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
          ...(purchasePrice !== undefined && { purchasePrice: parseFloat(purchasePrice) }),
          ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
        },
      });

      res.json({
        message: 'Asset updated successfully',
        asset,
      });
    } catch (error) {
      console.error('Update asset error:', error);
      res.status(500).json({ error: 'Failed to update asset' });
    }
  },

  // Delete asset
  async deleteAsset(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await prisma.asset.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      await prisma.asset.delete({ where: { id } });

      res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Delete asset error:', error);
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  },

  // Get asset performance
  async getAssetPerformance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const asset = await prisma.asset.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
      });

      if (!asset) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      // Get current price
      const [priceData] = await cryptoService.getPrices([asset.symbol]);
      const currentPrice = priceData?.current_price || 0;
      
      // Calculate performance
      const currentValue = asset.quantity * currentPrice;
      const costBasis = asset.quantity * asset.purchasePrice;
      const profitLoss = currentValue - costBasis;
      const profitLossPercentage = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

      res.json({
        asset,
        performance: {
          currentPrice,
          currentValue,
          costBasis,
          profitLoss,
          profitLossPercentage,
          change24h: priceData?.price_change_24h || 0,
          changePercentage24h: priceData?.price_change_percentage_24h || 0,
        },
      });
    } catch (error) {
      console.error('Get asset performance error:', error);
      res.status(500).json({ error: 'Failed to fetch asset performance' });
    }
  },
};
