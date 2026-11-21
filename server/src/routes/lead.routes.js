import { Router } from 'express';
import * as ctrl from '../controllers/lead.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate, validateObjectId } from '../middleware/validate.middleware.js';
import { createLeadSchema, listLeadsQuerySchema, updateLeadSchema } from '../validators/lead.validator.js';

const router = Router();
router.use(protect);

router.get('/stats', ctrl.stats); // must be registered before '/:id'
router
  .route('/')
  .get(validate(listLeadsQuerySchema, 'query'), ctrl.list)
  .post(validate(createLeadSchema), ctrl.create);
router
  .route('/:id')
  .all(validateObjectId('id'))
  .get(ctrl.getOne)
  .put(validate(updateLeadSchema), ctrl.update)
  .delete(ctrl.remove);

export default router;
