import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as transactionsController from './transactions.controller';

const router = Router();

router.use(authenticate);

router.get('/', transactionsController.getAll);

export default router;
