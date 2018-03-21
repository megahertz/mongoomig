#!/usr/bin/env node

'use strict';

const mongoose        = require('mongoose');
const Config          = require('./lib/Config');
const createMigration = require('./lib/createMigration');
const Migration       = require('./lib/Migration');
const migrationSchema = require('./lib/migrationSchema');
const args            = require('./lib/parseConsoleArgs')();

const HELP = `Usage: mongoomig [options] <command>

Commands:
  up [name]       Migrate up till given migration
  down [name]     Migrate down till given migration
  create <name>   Create a new migration
  list            Show migrations which are applied

Options:
  -c, --config=<path>      Load config from json or js file, default to
                             ./migrations/config.js
  -u, --url=<url>          Mongodb connection string
  --collection=<name>      Migrations collection, defaults to migrations
  --path=<path>            Where your migrations are stored, defaults to
                             ./migrations
  --reconnectInterval=<ms> Try to reconnect every <ms>, default 300
  --reconnectTries=<count> Try to reconnect <count> times, default 100
  --silent                 Silent mode, defaults to false`;

mongoose.Promise = global.Promise;

const cfg = new Config(args);
const MigrationModel = mongoose.model(
  'MigrationSchema',
  migrationSchema,
  cfg.collection
);
const migration = new Migration(cfg, MigrationModel);

(async () => {
  try {
    switch (cfg.command) {
      case 'up': {
        await migration.connect();
        await migration.up();
        console.log('Migration is successfully completed');
        break;
      }

      case 'down': {
        await migration.connect();
        await migration.down();
        !cfg.silent && console.log('Migration down is successfully completed');
        break;
      }

      case 'create': {
        const fileName = createMigration(cfg.path, cfg.name);
        !cfg.silent && console.log(`Migration ${fileName} created`);
        break;
      }

      case 'list': {
        await migration.connect();
        const list = await migration.list();
        const listString = list
          .map((r) => `${r.name} ${r.date} ${r.status}`)
          .join('\n');
        console.log(listString);
        break;
      }

      default: {
        console.log(HELP);
      }
    }
  } catch (e) {
    console.error(cfg.silent ? e.message : e.stack);
    process.exitCode = 1;
  } finally {
    await migration.disconnect();
  }
})();
