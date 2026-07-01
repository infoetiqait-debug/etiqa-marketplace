const express = require('express');
const { check } = require('express-validator');
const validateToken = require('../../middleware/auth');
const {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
} = require('../../controllers/collections');

const router = express.Router();

router.get('/', getCollections);
router.get('/:id', getCollectionById);
router.post(
  '/',
  validateToken,
  [
    check('collectionName', 'Collection name is required').not().isEmpty(),
    check('collectionName', 'Collection name must be at least 2 characters').isLength({ min: 2 }),
  ],
  createCollection,
);
router.put(
  '/:id',
  validateToken,
  [
    check('collectionName', 'Collection name must be at least 2 characters')
      .optional()
      .isLength({ min: 2 }),
  ],
  updateCollection,
);
router.delete('/:id', validateToken, deleteCollection);

module.exports = router;
