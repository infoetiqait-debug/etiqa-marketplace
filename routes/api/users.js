const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validateToken = require('../../middleware/auth');
const {
  register,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateWalletAddress,
} = require('../../controllers/users');

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
  ],
  register,
);

router.get('/me', validateToken, getCurrentUserProfile);
router.put(
  '/me',
  validateToken,
  [
    check('name', 'Name must be at least 2 characters')
      .optional()
      .isLength({ min: 2 }),
  ],
  updateCurrentUserProfile,
);
router.put(
  '/me/wallet',
  validateToken,
  [
    check('walletAddress', 'Wallet address is required').not().isEmpty(),
  ],
  updateWalletAddress,
);

module.exports = router;