const express = require('express');
const { check } = require('express-validator');
const validateToken = require('../../middleware/auth');
const {
  getNfts,
  getNftById,
  createNft,
  updateNft,
  deleteNft,
} = require('../../controllers/nfts');

const router = express.Router();

router.get('/', getNfts);
router.get('/:id', getNftById);
router.post(
  '/',
  validateToken,
  [
    check('title', 'NFT title is required').not().isEmpty(),
    check('title', 'NFT title must be at least 2 characters').isLength({ min: 2 }),
    check('price', 'Price must be a number').isFloat({ min: 0 }),
  ],
  createNft,
);
router.put(
  '/:id',
  validateToken,
  [
    check('title', 'NFT title must be at least 2 characters')
      .optional()
      .isLength({ min: 2 }),
    check('price', 'Price must be a number')
      .optional()
      .isFloat({ min: 0 }),
  ],
  updateNft,
);
router.delete('/:id', validateToken, deleteNft);

module.exports = router;
