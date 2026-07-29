import { Router } from 'express';
import MediaController from './media.controller.js';
import { uploadMiddleware } from './media.upload.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import { updateMediaSchema, mediaQuerySchema } from './media.schema.js';

const router = Router();

// All media endpoints require authentication
router.use(authenticate);

router.post(
  '/upload',
  authorize('media:create'),
  uploadMiddleware.single('file'),
  MediaController.uploadSingle,
);

router.post(
  '/upload-multiple',
  authorize('media:create'),
  uploadMiddleware.array('files', 10),
  MediaController.uploadMultiple,
);

router.get(
  '/',
  authorize('media:read'),
  validate(mediaQuerySchema),
  MediaController.list,
);

router.get(
  '/:id',
  authorize('media:read'),
  MediaController.getById,
);

router.patch(
  '/:id',
  authorize('media:update'),
  validate(updateMediaSchema),
  MediaController.update,
);

router.delete(
  '/:id',
  authorize('media:delete'),
  MediaController.delete,
);

export default router;