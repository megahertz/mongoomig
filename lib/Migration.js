'use strict';

const { readdirSync } = require('fs');
const mongoose        = require('mongoose');
const mongoosePackage = require('mongoose/package.json');
const { resolve }     = require('path');
const Config          = require('./Config');

/**
 * @property {Config}        config
 * @property {Promise<void>} connectPromise
 * @property {object}        migrationModel
 */
class Migration {
  /**
   * @param {object|Config} config
   * @param {object}        migrationModel
   */
  constructor(config = {}, migrationModel) {
    this.config = config instanceof Config ? config : new Config(config);
    this.migrationModel = migrationModel;
    this.requireModule(config.require);
  }

  async connect() {
    if (!this.connectPromise) {
      const options = {};

      if (mongoosePackage.version[0] === '4') {
        options.useMongoClient = true;
      }

      if (mongoosePackage.version[0] > 4) {
        options.useNewUrlParser = true;
      }

      const cfg = this.config;

      // By default, mongo client doesn't reconnect if the first attempt is
      // failed, but it's normal behavior inside Docker, when mongo is loaded
      // together with the app
      let connection;
      for (let i = 0; i < cfg.reconnectTries; i++) {
        try {
          this.connectPromise = mongoose.connect(cfg.url, options);
          connection = await this.connectPromise;
          break;
        } catch (e) {
          await new Promise(r => setTimeout(r, cfg.reconnectInterval));
        }
      }

      if (!connection) {
        throw new Error(`Unable to connect mongodb server ${cfg.url}`);
      }
    }

    return this.connectPromise;
  }

  // eslint-disable-next-line
  async disconnect() {
    return this.connectPromise ? mongoose.disconnect() : Promise.resolve();
  }

  async up() {
    const migrations = this.getMigrationFiles();
    const newMigrations = await this.migrationModel.filterForMigrateUp(
      migrations,
      this.config.name
    );

    for (const name of newMigrations) {
      const record = await this.migrationModel.addRecord(name);

      await this.executeMigration(name, 'up');

      record.completed = true;
      await record.save();
      !this.config.silent && console.log(`Successfully migrated: ${name}`);
    }
  }

  async down() {
    const migrations = await this.migrationModel.findDownTo(this.config.name);

    for (const record of migrations) {
      const name = record.name;
      await this.executeMigration(name, 'down');
      await record.remove();
      !this.config.silent && console.log(`Successfully migrated down: ${name}`);
    }
  }

  async list() {
    return this.migrationModel.list();
  }

  getMigrationFiles() {
    return readdirSync(this.config.path)
      .filter(file => file.match(/^\d+.*\.[jt]s$/))
      .map(file => file.slice(0, -3));
  }

  async executeMigration(migrationName, direction) {
    const filePath = resolve(this.config.path, migrationName + '.js');

    let module;
    try {
      // eslint-disable-next-line
      module = require(filePath);
    } catch (e) {
      throw new Error(
        `Couldn't load migration from the file ${filePath} ${e.message}`
      );
    }

    if (typeof module[direction] !== 'function') {
      throw new Error(
        `Couldn't load migration from the file ${filePath}. It doesn't `
        + `export function ${direction}()`
      );
    }

    try {
      await module[direction]();
    } catch (e) {
      e.message = `Couldn't execute migration ${migrationName}: ` + e.message;
      throw e;
    }
  }

  requireModule(module) {
    if (!module) {
      return;
    }

    try {
      // eslint-disable-next-line global-require
      require(module);
    } catch (e) {
      throw new Error(
        `Cannot require ${module}. Make sure it's installed. ${e.message}`
      );
    }
  }
}

module.exports = Migration;
