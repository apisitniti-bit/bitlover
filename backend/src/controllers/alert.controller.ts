import { Request, Response } from 'express';
import { prisma } from '../server';

export const alertController = {
  // Get all user alerts
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const alerts = await prisma.priceAlert.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.json(alerts);
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  },

  // Create price alert
  async createAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { symbol, targetPrice, condition } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!symbol || targetPrice === undefined || !condition) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (!['ABOVE', 'BELOW'].includes(condition.toUpperCase())) {
        res.status(400).json({ error: 'Condition must be ABOVE or BELOW' });
        return;
      }

      const alert = await prisma.priceAlert.create({
        data: {
          userId,
          symbol: symbol.toUpperCase(),
          targetPrice: parseFloat(targetPrice),
          condition: condition.toUpperCase(),
          isActive: true,
        },
      });

      res.status(201).json({
        message: 'Price alert created successfully',
        alert,
      });
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  },

  // Update alert
  async updateAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { targetPrice, condition, isActive } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await prisma.priceAlert.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({ error: 'Alert not found' });
        return;
      }

      const alert = await prisma.priceAlert.update({
        where: { id },
        data: {
          ...(targetPrice !== undefined && { targetPrice: parseFloat(targetPrice) }),
          ...(condition && { condition: condition.toUpperCase() }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        message: 'Alert updated successfully',
        alert,
      });
    } catch (error) {
      console.error('Update alert error:', error);
      res.status(500).json({ error: 'Failed to update alert' });
    }
  },

  // Delete alert
  async deleteAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Verify ownership
      const existing = await prisma.priceAlert.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        res.status(404).json({ error: 'Alert not found' });
        return;
      }

      await prisma.priceAlert.delete({ where: { id } });

      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  },
};
