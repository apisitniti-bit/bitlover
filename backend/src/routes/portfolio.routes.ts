import { Router } from 'express';
import { portfolioController } from '../controllers/portfolio.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', portfolioController.getAllPortfolios);
router.get('/:id', portfolioController.getPortfolio);
router.post('/', portfolioController.createPortfolio);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);
router.get('/:id/summary', portfolioController.getPortfolioSummary);

export default router;
