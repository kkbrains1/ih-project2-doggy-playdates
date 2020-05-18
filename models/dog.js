'use strict';

const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  name: {
    type: String
  },
  breed: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Breed'
  },
  personality: {
    type: String
  },
  size: {
    type: String
  },
  photo: {
    type: String
  }
});

const Dog = mongoose.model('Dog', dogSchema);
module.exports = Dog;