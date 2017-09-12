'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  body: String,
  date: { type: Date, default: Date.now() },
  user: { type:  mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Post', schema);
