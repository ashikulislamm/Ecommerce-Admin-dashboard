import { Router } from 'express';
import MediaFolderController from './media-folder.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/permission.middleware.js';
import { validateBody } from '../../middlewares/validation.middleware.js';
import {
  createMediaFolderSchema,
  updateMediaFolderSchema,
  moveMediaSchema,
} from './media-folder.schema.js';

const router = Router();

router.use(authenticate);

router.get('/tree', authorize('media:read'), MediaFolderController.getTree);
router.post(
  '/',
  authorize('media:create'),
  validateBody(createMediaFolderSchema),
  MediaFolderController.createFolder,
);
router.post(
  '/move-media',
  authorize('media:update'),
  validateBody(moveMediaSchema),
  MediaFolderController.moveMedia,
);
router.get('/:id', authorize('media:read'), MediaFolderController.getFolderById);
router.put(
  '/:id',
  authorize('media:update'),
  validateBody(updateMediaFolderSchema),
  MediaFolderController.updateFolder,
);
router.delete('/:id', authorize('media:delete'), MediaFolderController.deleteFolder);

export default router;
