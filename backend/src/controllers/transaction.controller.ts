import { Request, Response } from 'express';
import { prisma } from '../server';

export const transactionController = {
  // Get all transactions for a portfolio
  async getTransactionsByPortfolio(req: Request, res: Response): Promise<void> {
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

      const transactions = await prisma.transaction.findMany({
        where: { portfolioId },
        orderBy: { timestamp: 'desc' },
      });

      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  },

  // Get single transaction
  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const transaction = await prisma.transaction.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
        include: {
          portfolio: true,
        },
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      res.json(transaction);
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    }
  },

  // Create new transaction
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { portfolioId, type, symbol, quantity, price, fee, timestamp, notes } = req.body;

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
      if (!type || !symbol || quantity === undefined || price === undefined) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!['BUY', 'SELL'].includes(type.toUpperCase())) {
        res.status(400).json({ error: 'Transaction type must be BUY or SELL' });
        return;
      }

      const transaction = await prisma.transaction.create({
        data: {
          portfolioId,
          type: type.toUpperCase(),
          symbol: symbol.toUpperCase(),
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          fee: fee ? parseFloat(fee) : 0,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          notes: notes || null,
        },
      });

      // Update or create asset
      if (type.toUpperCase() === 'BUY') {
        const existingAsset = await prisma.asset.findFirst({
          where: { portfolioId, symbol: symbol.toUpperCase() },
        });

        if (existingAsset) {
          // Update existing asset
          const newQuantity = existingAsset.quantity + parseFloat(quantity);
          const newAvgPrice = (
            (existingAsset.quantity * existingAsset.purchasePrice) + 
            (parseFloat(quantity) * parseFloat(price))
          ) / newQuantity;

          await prisma.asset.update({
            where: { id: existingAsset.id },
            data: {
              quantity: newQuantity,
              purchasePrice: newAvgPrice,
            },
          });
        } else {
          // Create new asset
          await prisma.asset.create({
            data: {
              portfolioId,
              symbol: symbol.toUpperCase(),
              name: symbol.toUpperCase(),
              quantity: parseFloat(quantity),
              purchasePrice: parseFloat(price),
            },
          });
        }
      } else if (type.toUpperCase() === 'SELL') {
        // Reduce asset quantity
        const existingAsset = await prisma.asset.findFirst({
          where: { portfolioId, symbol: symbol.toUpperCase() },
        });

        if (existingAsset) {
          const newQuantity = existingAsset.quantity - parseFloat(quantity);
          
          if (newQuantity <= 0) {
            // Delete asset if quantity is zero or negative
            await prisma.asset.delete({ where: { id: existingAsset.id } });
          } else {
            // Update quantity
            await prisma.asset.update({
              where: { id: existingAsset.id },
              data: { quantity: newQuantity },
            });
          }
        }
      }

      console.log(`✅ Transaction created: ${type} ${quantity} ${symbol} at $${price} for portfolio ${portfolioId}`);

      res.status(201).json({
        message: 'Transaction recorded successfully',
        transaction,
      });
    } catch (error) {
      console.error('❌ Create transaction error:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      res.status(500).json({ 
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Update transaction
  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { quantity, price, fee, timestamp, notes } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await prisma.transaction.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(fee !== undefined && { fee: parseFloat(fee) }),
          ...(timestamp && { timestamp: new Date(timestamp) }),
          ...(notes !== undefined && { notes }),
        },
      });

      res.json({
        message: 'Transaction updated successfully',
        transaction,
      });
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  },

  // Delete transaction
  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await prisma.transaction.findFirst({
        where: { 
          id,
          portfolio: { userId },
        },
      });

      if (!existing) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      await prisma.transaction.delete({ where: { id } });

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  },

  // Get user's transaction history across all portfolios
  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          portfolio: { userId },
        },
        include: {
          portfolio: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      res.json(transactions);
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  },
};
