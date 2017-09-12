'use strict';

const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
  async up() {
    const user = await User.findOne({ name: 'test-user' });
    await Post.create({ body: 'TestPost', user: user._id });
  },

  async down() {
    const user = await User.findOne({ name: 'test-user' });
    await Post.deleteMany({ user: user._id });
  },
};
