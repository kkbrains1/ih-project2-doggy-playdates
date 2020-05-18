'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Post'
    },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event'
  }
},
{
  timestamps: {
    createdAt: 'createdDate',
    updatedAt: 'updatedDate'
  }
}
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
