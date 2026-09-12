const express = require('express');
const controller = require('../controllers/product.controller');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { upload } = require('../middlewares/upload');
const { asyncHandler } = require('../utils/async-handler');
const { productSchema, statusSchema, sizeSchema, sizeUpdateSchema, productQuerySchema } = require('../validators/product.validator');

const router = express.Router();
router.get('/', validate(productQuerySchema, 'query'), asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.get));
router.post('/', requireAuth, validate(productSchema), asyncHandler(controller.create));
router.put('/:id', requireAuth, validate(productSchema), asyncHandler(controller.update));
router.delete('/:id', requireAuth, asyncHandler(controller.remove));
router.patch('/:id/status', requireAuth, validate(statusSchema), asyncHandler(controller.status));
router.post('/:id/images', requireAuth, upload.array('images', 5), asyncHandler(controller.addImages));
router.delete('/:id/images/:imageId', requireAuth, asyncHandler(controller.deleteImage));
router.post('/:id/sizes', requireAuth, validate(sizeSchema), asyncHandler(controller.addSize));
router.put('/:id/sizes/:sizeId', requireAuth, validate(sizeUpdateSchema), asyncHandler(controller.updateSize));
router.delete('/:id/sizes/:sizeId', requireAuth, asyncHandler(controller.deleteSize));

module.exports = router;
