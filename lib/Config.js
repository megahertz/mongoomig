'use strict';

const { join } = require('path');

const DEFAULT_URL   = 'mongodb://localhost/migrations';
const DEFAULT_PATH = join(process.cwd(), 'migrations');
/**
 * @property {string}  collection
 * @property {string}  command
 * @property {string}  config
 * @property {string}  name
 * @property {string}  path
 * @property {boolean} silent
 * @property {string}  url
 */
class Config {
  constructor(config = {}) {
    const args = config._ || [];

    this.config = this.def(config, 'config', config.c);
    this.loadConfigFile(config.path || DEFAULT_PATH);

    this.collection = this.def(config, 'collection', 'migrations');
    this.command    = this.def(config, 'command', args[0] || 'help');
    this.name       = this.def(config, 'name', args[1]);
    this.path       = this.def(config, 'path', DEFAULT_PATH);
    this.silent     = this.def(config, 'silent', false);
    this.url        = this.def(config, 'url', config.u, DEFAULT_URL);
  }

  loadConfigFile(defaultPath) {
    const isCustomConfig = Boolean(this.config);
    if (!this.config) {
      this.config = join(defaultPath, 'config.js');
    }

    try {
      // eslint-disable-next-line
      const config = require(this.config);
      Object.assign(this, config);
    } catch (e) {
      if (isCustomConfig) {
        e.message = `Couldn't load the config: ${e.message}`;
        throw e;
      }
    }
  }


  def(config, name, ...defaults) {
    return (
      config[name] ||
      process.env['MONGOOMIG_' + name.toUpperCase()] ||
      this[name] ||
      defaults.find(Boolean)
    );
  }
}

module.exports = Config;
