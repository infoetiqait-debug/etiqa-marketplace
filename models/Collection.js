const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema(
  {
    collectionName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Art',
    },
    floorPrice: {
      type: Number,
      default: 0,
    },
    itemsCount: {
      type: Number,
      default: 0,
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

CollectionSchema.pre('save', function (next) {
  if (!this.slug && this.collectionName) {
    this.slug = this.collectionName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('collection', CollectionSchema);
