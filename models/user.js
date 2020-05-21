'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true
    },
    passwordHash: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending Confirmation', 'Active'],
      default: 'Pending Confirmation'
    },
    confirmationCode: {
      type: String,
      unique: true
    },
    dogs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dog'
    }],
    photoUrl: String
  },
  {
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate'
    }
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
