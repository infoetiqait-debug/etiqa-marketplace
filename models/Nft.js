const mongoose = require('mongoose');

const NftSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'collection',
      required: false,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isListed: {
      type: Boolean,
      default: true,
    },
    tokenStandard: {
      type: String,
      enum: ['ERC721', 'ERC1155'],
      default: 'ERC721',
    },
    blockchain: {
      type: String,
      default: 'Ethereum',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('nft', NftSchema);
