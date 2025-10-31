import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/portfolio-performance', analyticsController.getPortfolioPerformance);
router.get('/asset-allocation', analyticsController.getAssetAllocation);
router.get('/profit-loss', analyticsController.getProfitLoss);
router.get('/roi', analyticsController.getROI);
router.get('/top-holdings', analyticsController.getTopHoldings);

export default router;
