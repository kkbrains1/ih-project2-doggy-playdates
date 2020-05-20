'use strict';

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [
        {
          type: Number,
          min: -180,
          max: 180
        }
      ]
    },
    address: {
      type: String
    },
    date: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    photo: {
      type: String
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      //required: true,
      ref: 'User'
    }
  },
  {
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate'
    }
  }
);

eventSchema.index({ location: '2dsphere' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
