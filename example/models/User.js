'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: String,
});

module.exports = mongoose.model('User', schema);
