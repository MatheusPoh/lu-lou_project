const express = require('express');
const controller = require('../controllers/category.controller');
const { requireAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { asyncHandler } = require('../utils/async-handler');
const { categorySchema } = require('../validators/category.validator');

const router = express.Router();
router.get('/', asyncHandler(controller.list));
router.post('/', requireAuth, validate(categorySchema), asyncHandler(controller.create));
router.put('/:id', requireAuth, validate(categorySchema), asyncHandler(controller.update));
router.delete('/:id', requireAuth, asyncHandler(controller.remove));

module.exports = router;
