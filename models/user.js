'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String
  },
  dogName: {
    type: String
  },
  dogBreed: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Breed'
  },
  dogPersonality: {
    type: String
  },
  dogSize: {
    type: String
  },
  dogPhoto: {
    type: String
  }
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