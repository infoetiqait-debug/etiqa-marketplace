const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, ConflictError, NotFoundError } = require('../utils/errors');
const { sendSuccess, sendValidationError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * @route   POST api/users
 * @desc    Register a new user
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { name, email, password } = req.body;

  const existingUserByEmail = await User.findOne({ email: email.toLowerCase().trim() });
  const existingUserByName = await User.findOne({ name: name.trim() });

  if (existingUserByEmail || existingUserByName) {
    throw new ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    chipsAmount: config.INITIAL_CHIPS_AMOUNT,
    provider: 'local',
  });

  const payload = {
    user: {
      id: newUser.id,
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
        return sendSuccess(res, { token }, SUCCESS_MESSAGES.REGISTRATION_SUCCESS, HTTP_STATUS.CREATED);
      },
    );
  });
});

/**
 * @route   GET api/users/me
 * @desc    Retrieve current user profile
 * @access  Private
 */
exports.getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  return sendSuccess(res, { user }, 'User profile retrieved successfully');
});

/**
 * @route   PUT api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
exports.updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const {
    name,
    bio,
    avatarUrl,
    socialLinks,
    walletAddress,
  } = req.body;

  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (walletAddress !== undefined) user.walletAddress = walletAddress.trim().toLowerCase();
  if (socialLinks && typeof socialLinks === 'object') {
    user.socialLinks = {
      ...user.socialLinks,
      ...socialLinks,
    };
  }

  user.updatedAt = new Date();
  await user.save();

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  return sendSuccess(res, { user: userWithoutPassword }, 'User profile updated successfully');
});

/**
 * @route   PUT api/users/me/wallet
 * @desc    Bind wallet address to user profile
 * @access  Private
 */
exports.updateWalletAddress = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const { walletAddress } = req.body;
  if (!walletAddress || typeof walletAddress !== 'string') {
    return sendValidationError(res, [{ msg: 'Wallet address is required' }]);
  }

  user.walletAddress = walletAddress.trim().toLowerCase();
  user.updatedAt = new Date();
  await user.save();

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  return sendSuccess(res, { user: userWithoutPassword }, 'Wallet address updated successfully');
