import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import * as investmentsController from './investments.controller';

const router = Router();

router.use(authenticate);

router.get('/', investmentsController.getAll);
router.get('/:id', investmentsController.getOne);
router.post('/', investmentsController.create);
router.post('/:id/sell', investmentsController.sell);
router.put('/:id', investmentsController.update);
router.delete('/:id', investmentsController.remove);

export default router;
