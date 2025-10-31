import { Router } from 'express';
import { assetController } from '../controllers/asset.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/portfolio/:portfolioId', assetController.getAssetsByPortfolio);
router.get('/:id', assetController.getAsset);
router.post('/portfolio/:portfolioId', assetController.addAsset);
router.put('/:id', assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);
router.get('/:id/performance', assetController.getAssetPerformance);

export default router;
