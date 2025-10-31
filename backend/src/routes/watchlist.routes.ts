import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', watchlistController.getWatchlist);
router.post('/', watchlistController.addToWatchlist);
router.delete('/:symbol', watchlistController.removeFromWatchlist);

export default router;
