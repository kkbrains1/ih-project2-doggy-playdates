'use strict';

const mongoose = require('mongoose');

const breedSchema = new mongoose.Schema({
  breed: {
    type: String
  }
});

const Breed = mongoose.model('Breed', breedSchema);

module.exports = Breed;
