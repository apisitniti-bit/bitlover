import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', alertController.getAlerts);
router.post('/', alertController.createAlert);
router.put('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);

export default router;
