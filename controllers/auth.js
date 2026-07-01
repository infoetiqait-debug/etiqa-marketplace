const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const config = require('../config');
const User = require('../models/User');
const { asyncHandler, NotFoundError, AuthenticationError } = require('../utils/errors');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * @route   GET api/auth
 * @desc    Get current authenticated user
 * @access  Private
 */
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return sendSuccess(res, { user }, SUCCESS_MESSAGES.USER_RETRIEVED);
});

/**
 * @route   POST api/auth
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const payload = {
    user: {
      id: user.id,
    },
  };

  const tokenExpiry = config.JWT_TOKEN_EXPIRES_IN || '7d';
  const jwtSecret = config.JWT_SECRET || 'demo-secret-key-change-in-production';

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: tokenExpiry },
      (err, token) => {
        if (err) {
          reject(new Error('Failed to generate token'));
          return;
        }
        return sendSuccess(res, { token }, SUCCESS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK);
      },
    );
  });
});

exports.googleAuth = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { idToken } = req.body;
  const googleClientId = config.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    throw new AuthenticationError('Google client ID is not configured');
  }

  const googleResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
      idToken,
    )}`,
  );

  if (!googleResponse.ok) {
    throw new AuthenticationError(ERROR_MESSAGES.INVALID_GOOGLE_TOKEN);
  }

  const googleData = await googleResponse.json();

  if (googleData.aud !== googleClientId) {
    throw new AuthenticationError(ERROR_MESSAGES.INVALID_GOOGLE_TOKEN);
  }

  if (googleData.email_verified !== 'true' && googleData.email_verified !== true) {
    throw new AuthenticationError(ERROR_MESSAGES.GOOGLE_EMAIL_NOT_VERIFIED);
  }

  const email = googleData.email.toLowerCase().trim();
  const name = googleData.name || email.split('@')[0];

  let user = await User.findOne({ email });

  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      chipsAmount: config.INITIAL_CHIPS_AMOUNT,
      provider: 'google',
      googleId: googleData.sub,
      avatarUrl: googleData.picture || '',
    });
  }

  const payload = {
    user: {
      id: user.id,
    },
  };

  const tokenExpiry = config.JWT_TOKEN_EXPIRES_IN || '7d';
  const jwtSecret = config.JWT_SECRET || 'demo-secret-key-change-in-production';

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: tokenExpiry },
      (err, token) => {
        if (err) {
          reject(new Error('Failed to generate token'));
          return;
        }
        return sendSuccess(res, { token }, SUCCESS_MESSAGES.LOGIN_SUCCESS, HTTP_STATUS.OK);
      },
    );
  });
});
