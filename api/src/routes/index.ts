import { Router } from 'express';
import calculationRoutes from './calculations';
import dataRoutes from './data';

const router = Router();

router.use('/calculate', calculationRoutes);
router.use('/data', dataRoutes);

export default router;