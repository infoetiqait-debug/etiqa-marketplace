const { validationResult } = require('express-validator');
const Nft = require('../models/Nft');
const Collection = require('../models/Collection');
const User = require('../models/User');
const { asyncHandler, NotFoundError, ConflictError } = require('../utils/errors');
const { sendSuccess, sendValidationError } = require('../utils/response');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

/**
 * @route   GET api/nfts
 * @desc    Get all NFTs or filter by collection
 * @access  Public
 */
exports.getNfts = asyncHandler(async (req, res) => {
  const { collectionId, search, minPrice, maxPrice, blockchain, listed } = req.query;

  const filter = {};

  if (collectionId) filter.collection = collectionId;
  if (blockchain) filter.blockchain = blockchain;
  if (listed !== undefined) filter.isListed = listed === 'true';
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  let query = Nft.find(filter)
    .populate('owner', 'name email avatarUrl')
    .populate('creator', 'name email avatarUrl')
    .populate('collection', 'collectionName imageUrl slug');

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    query = query.find({
      $or: [
        { title: regex },
        { description: regex },
        { tags: regex },
      ],
    });
  }

  const nfts = await query.sort({ createdAt: -1 });

  return sendSuccess(res, { nfts }, 'NFTs retrieved successfully');
});

/**
 * @route   GET api/nfts/:id
 * @desc    Get NFT by ID
 * @access  Public
 */
exports.getNftById = asyncHandler(async (req, res) => {
  const nft = await Nft.findById(req.params.id)
    .populate('owner', 'name email avatarUrl')
    .populate('creator', 'name email avatarUrl')
    .populate('collection', 'collectionName imageUrl slug');

  if (!nft) {
    throw new NotFoundError(ERROR_MESSAGES.NFT_NOT_FOUND);
  }

  return sendSuccess(res, { nft }, 'NFT retrieved successfully');
});

/**
 * @route   POST api/nfts
 * @desc    Create a new NFT
 * @access  Private
 */
exports.createNft = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendValidationError(res, errors.array());
  }

  const {
    title,
    description,
    price,
    creatorId,
    collectionId,
    imageUrl,
    blockchain,
    tokenStandard,
    tags,
  } = req.body;

  const owner = await User.findById(req.user.id);
  if (!owner) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const creator = creatorId
    ? await User.findById(creatorId)
    : owner;
  if (!creator) {
    throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  const collection = collectionId
    ? await Collection.findById(collectionId)
    : null;

  if (collectionId && !collection) {
    throw new NotFoundError(ERROR_MESSAGES.COLLECTION_NOT_FOUND);
  }

  const newNft = await Nft.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    price: Number(price) || 0,
    owner: owner._id,
    creator: creator._id,
    collection: collection ? collection._id : null,
    imageUrl: imageUrl || '',
    blockchain: blockchain || 'Ethereum',
    tokenStandard: tokenStandard || 'ERC721',
    tags: Array.isArray(tags) ? tags : [],
  });

  if (collection) {
    collection.itemsCount += 1;
    await collection.save();
  }

  return sendSuccess(res, { nft: newNft }, 'NFT created successfully', HTTP_STATUS.CREATED);
});

/**
 * @route   PUT api/nfts/:id
 * @desc    Update an NFT listing
 * @access  Private
 */
exports.updateNft = asyncHandler(async (req, res) => {
  const nft = await Nft.findById(req.params.id);
  if (!nft) {
    throw new NotFoundError(ERROR_MESSAGES.NFT_NOT_FOUND);
  }

  const { title, description, price, imageUrl, isListed, tags, blockchain, tokenStandard } = req.body;

  if (title !== undefined) nft.title = title.trim();
  if (description !== undefined) nft.description = description.trim();
  if (price !== undefined) nft.price = Number(price);
  if (imageUrl !== undefined) nft.imageUrl = imageUrl;
  if (isListed !== undefined) nft.isListed = Boolean(isListed);
  if (tags !== undefined) nft.tags = Array.isArray(tags) ? tags : nft.tags;
  if (blockchain !== undefined) nft.blockchain = blockchain;
  if (tokenStandard !== undefined) nft.tokenStandard = tokenStandard;

  await nft.save();

  return sendSuccess(res, { nft }, 'NFT updated successfully');
});

/**
 * @route   DELETE api/nfts/:id
 * @desc    Delete an NFT listing
 * @access  Private
 */
exports.deleteNft = asyncHandler(async (req, res) => {
  const nft = await Nft.findById(req.params.id);
  if (!nft) {
    throw new NotFoundError(ERROR_MESSAGES.NFT_NOT_FOUND);
  }

  await nft.remove();

  return sendSuccess(res, null, 'NFT deleted successfully');
});
