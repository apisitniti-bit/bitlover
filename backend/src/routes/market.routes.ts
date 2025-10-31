import { Router } from 'express';
import { marketController } from '../controllers/market.controller';

const router = Router();

// Public routes - no authentication required
router.get('/live', marketController.getMarketPrices); // Get all real-time prices from DB
router.get('/prices', marketController.getPrices);
router.get('/coins/:symbol', marketController.getCoinDetail);
router.get('/top', marketController.getTopCoins);
router.get('/trending', marketController.getTrending);
router.get('/search', marketController.searchCoins);
router.get('/historical/:symbol', marketController.getHistoricalData);

export default router;
