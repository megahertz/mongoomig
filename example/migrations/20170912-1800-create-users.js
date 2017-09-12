'use strict';

const User = require('../models/User');

module.exports = {
  async up() {
    await User.create({ name: 'test-user' });
  },

  async down() {
    await User.deleteOne({ name: 'test-user' });
  },
};
