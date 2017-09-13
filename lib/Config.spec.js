'use strict';

const { expect } = require('chai');
const { resolve } = require('path');
const Config = require('./Config');

describe('Config', () => {
  it('should keep default values', () => {
    const config = new Config();
    expect(config.collection).to.equal('migrations');
  });

  it('should read command line args', () => {
    const config = new Config({ url: 'test1', _: ['test2'] });
    expect(config.url).to.equal('test1');
    expect(config.command).to.equal('test2');
  });

  it('should read environment variables', () => {
    process.env.MONGOOMIG_URL = 'test3';
    const config = new Config();
    expect(config.url).to.equal('test3');
    delete process.env.MONGOOMIG_URL;
  });

  it('should read config file', () => {
    const config = new Config({
      path: resolve(__dirname, '../example/migrations'),
    });
    expect(config.url).to.equal('mongodb://localhost/tiny-blog');
  });

  it('should throw if a custom config not found', () => {
    const construct = () => {
      return new Config({ c: '/tmp/not-existed/config.js' });
    };

    expect(construct).to.throw();
  });
});
