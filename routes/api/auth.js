const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const validateToken = require('../../middleware/auth');
const { getCurrentUser, login, googleAuth } = require('../../controllers/auth');

router.get('/', validateToken, getCurrentUser);

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login,
);

router.post(
  '/google',
  [check('idToken', 'Google ID token is required').not().isEmpty()],
  googleAuth,
);

module.exports = router;                                                                                                                                                                                            