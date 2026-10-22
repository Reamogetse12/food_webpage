import { Router } from 'express';
import { getOrders, getOrderById, createOrder, updateOrderStatus } from '../controllers/orders.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',           requireAuth, getOrders);
router.get('/:id',        requireAuth, getOrderById);
router.post('/',          requireAuth, createOrder);
router.patch('/:id/status', requireAuth, updateOrderStatus);

export default router;
