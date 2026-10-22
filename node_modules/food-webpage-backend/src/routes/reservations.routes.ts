import { Router } from 'express';
import { getReservations, createReservation, updateReservationStatus } from '../controllers/reservations.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',             requireAuth, getReservations);
router.post('/',            requireAuth, createReservation);
router.patch('/:id/status', requireAuth, updateReservationStatus);

export default router;
