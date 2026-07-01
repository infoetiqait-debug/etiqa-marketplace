const { validationResult } = require('express-validator');
const Collection = require('../models/Collection');
const User = require('../models/User');
const { asyncHandler, NotFoundError, ConflictError } = require('../utils/errors');
const { sendSuccess, sendValidationError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * @route   GET api/collections
 * @desc    Get all NFT collections
 * @access  Public
 */
exports.getCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find()
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { collections }, 'Collections retrieved successfully');
});

/**
 * @route   GET api/collections/:id
 * @desc    Get collection by ID
 * @access  Public
 */
exports.getCollectionById = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id).populate(
    'owner',
    'name email',
  );

  if (!collection) {
    throw new NotFoundError(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
  }

  return sendSuccess(res, { collection }, 'Collection retrieved successfully');
});

/**
 * @route   POST api/collections
 * @desc    Create a new NFT collection
 * @access  Private
 */
exports.createCollection = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const { collectionName, description, imageUrl, category } = req.body;

  const existingCollection = await Collection.findOne({
    collectionName: collectionName.trim(),
  });
  if (existingCollection) {
    throw new ConflictError(ERROR_MESSAGES.COLLECTION_ALREADY_EXISTS);
  }

  const owner = await User.findById(req.user.id);

  const newCollection = await Collection.create({
    collectionName: collectionName.trim(),
    description: description ? description.trim() : '',
    owner: owner ? owner._id : null,
    imageUrl: imageUrl || '',
    category: category || 'Art',
  });

  return sendSuccess(res, { collection: newCollection }, 'Collection created successfully', HTTP_STATUS.CREATED);
});

/**
 * @route   PUT api/collections/:id
 * @desc    Update an existing NFT collection
 * @access  Private
 */
exports.updateCollection = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    throw new NotFoundError(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
  }

  const { collectionName, description, imageUrl, category, floorPrice } = req.body;

  if (collectionName) collection.collectionName = collectionName.trim();
  if (description !== undefined) collection.description = description.trim();
  if (imageUrl !== undefined) collection.imageUrl = imageUrl;
  if (category !== undefined) collection.category = category;
  if (floorPrice !== undefined) collection.floorPrice = Number(floorPrice);

  await collection.save();

  return sendSuccess(res, { collection }, 'Collection updated successfully');
});

/**
 * @route   DELETE api/collections/:id
 * @desc    Delete an NFT collection
 * @access  Private
 */
exports.deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection) {
    throw new NotFoundError(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
  }

  await collection.remove();

  return sendSuccess(res, null, 'Collection deleted successfully');
});
