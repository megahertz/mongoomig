'use strict';

const { resolve } = require('path');

const DEFAULT_PATH = resolve(process.cwd(), 'migrations');
/**
 * @property {string}   collection
 * @property {string}   command
 * @property {boolean}  debug
 * @property {string}   config
 * @property {string}   name
 * @property {string}   path
 * @property {number}   reconnectInterval
 * @property {number}   reconnectTries
 * @property {string[]} require
 * @property {boolean}  silent
 * @property {string}   url
 */
class Config {
  constructor(config = {}) {
    const args = config._ || [];

    this.config = this.def(config, 'config', config.c);
    this.loadConfigFile(config.path || DEFAULT_PATH);

    this.collection        = this.def(config, 'collection', 'migrations');
    this.debug             = this.def(config, 'debug', false);
    this.command           = this.def(config, 'command', args[0] || 'help');
    this.name              = this.def(config, 'name', args[1]);
    this.path              = this.def(config, 'path', config.p, DEFAULT_PATH);
    this.reconnectInterval = this.def(config, 'reconnectInterval', 300);
    this.reconnectTries    = this.def(config, 'reconnectTries', 100);
    this.require           = this.def(config, 'require', config.r);
    this.silent            = this.def(config, 'silent', config.s, false);
    this.url               = this.def(
      config,
      'url',
      config.u || process.env.MONGO_URL
    );

    if (!Array.isArray(this.require)) {
      this.require = [this.require];
    }
  }

  loadConfigFile(defaultPath) {
    const isCustomConfig = Boolean(this.config);
    if (!this.config) {
      this.config = resolve(defaultPath, 'config.js');
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
      config[name]
      || process.env['MONGOOMIG_' + name.toUpperCase()]
      || this[name]
      || defaults.find(Boolean)
    );
  }
}

module.exports = Config;
