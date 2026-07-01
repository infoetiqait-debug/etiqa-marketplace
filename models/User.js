const config = require('../config');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
    walletAddress: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    socialLinks: {
      facebook: { type: String, default: '', trim: true },
      twitter: { type: String, default: '', trim: true },
      instagram: { type: String, default: '', trim: true },
      discord: { type: String, default: '', trim: true },
      website: { type: String, default: '', trim: true },
    },
    chipsAmount: {
      type: Number,
      default: config.INITIAL_CHIPS_AMOUNT,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('user', UserSchema);
