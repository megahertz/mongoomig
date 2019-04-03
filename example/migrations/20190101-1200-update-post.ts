'use strict';

const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
  async up() {
    const post = await Post.findOne({ body: 'TestPost' });
    post.body = 'Test Post';
    await post.save();
  },

  async down() {
    const post = await Post.findOne({ body: 'Test Post' });
    post.body = 'TestPost';
    await post.save();
  },
};
