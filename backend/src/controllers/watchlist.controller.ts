import { Request, Response } from 'express';
import { prisma } from '../server';

export const watchlistController = {
  // Get user's watchlist
  async getWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const watchlist = await prisma.watchlist.findMany({
        where: { userId },
        orderBy: { addedAt: 'desc' },
      });

      res.json(watchlist);
    } catch (error) {
      console.error('Get watchlist error:', error);
      res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
  },

  // Add coin to watchlist
  async addToWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { symbol, name } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!symbol || !name) {
        res.status(400).json({ error: 'Symbol and name are required' });
        return;
      }

      // Check if already in watchlist
      const existing = await prisma.watchlist.findFirst({
        where: { userId, symbol: symbol.toUpperCase() },
      });

      if (existing) {
        res.status(400).json({ error: 'Coin already in watchlist' });
        return;
      }

      const watchlistItem = await prisma.watchlist.create({
        data: {
          userId,
          symbol: symbol.toUpperCase(),
          name,
        },
      });

      res.status(201).json({
        message: 'Added to watchlist successfully',
        item: watchlistItem,
      });
    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({ error: 'Failed to add to watchlist' });
    }
  },

  // Remove from watchlist
  async removeFromWatchlist(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { symbol } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const watchlistItem = await prisma.watchlist.findFirst({
        where: { userId, symbol: symbol.toUpperCase() },
      });

      if (!watchlistItem) {
        res.status(404).json({ error: 'Item not found in watchlist' });
        return;
      }

      await prisma.watchlist.delete({ where: { id: watchlistItem.id } });

      res.json({ message: 'Removed from watchlist successfully' });
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({ error: 'Failed to remove from watchlist' });
    }
  },
};
