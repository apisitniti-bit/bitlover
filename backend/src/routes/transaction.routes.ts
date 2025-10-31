import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/portfolio/:portfolioId', transactionController.getTransactionsByPortfolio);
router.get('/history', transactionController.getTransactionHistory);
router.get('/:id', transactionController.getTransaction);
router.post('/', transactionController.createTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
