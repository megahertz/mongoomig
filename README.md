# mongoomig
[![Build Status](https://travis-ci.org/megahertz/mongoomig.svg?branch=master)](https://travis-ci.org/megahertz/mongoomig)
[![npm version](https://badge.fury.io/js/mongoomig.svg)](https://badge.fury.io/js/mongoomig)
[![Dependencies status](https://david-dm.org/megahertz/mongoomig/status.svg)](https://david-dm.org/megahertz/mongoomig)

## Description

Yet another mongoose migration tool

### Key features

 - Async/await is default concept
 - Mongoose 4.11 support without deprecation warning
 - Could be configured through command line arguments, environment
 variables or config file
 - No dependencies

This module requires node 8 at least. But feel free to create an issue
if you want this package to support older versions.

## Installation

Install with [npm](https://npmjs.org/package/mongoomig):

    $ npm install --save mongoomig

## Usage

1. Create a migration. The following command creates a new migration
    file ./migrations/${date}-first-migration.js

    $ mongoomig create first-migration

2. Write migration code

    ```js
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
    ```

3. Execute the migration

    $ mongoomig up

Just it. Also you can check [the example](example/migrations).

## Options

### Command line

```sh
Usage: mongoomig [options] <command>

Commands:
  up [name]       Migrate up till given migration
  down [name]     Migrate down till given migration
  create <name>   Create a new migration
  list            Show migrations which are applied

Options:
  -c, --config=<path>   Load config from json or js file, default to
                          ./migrations/config.js
  -u, --url=<url>       Mongodb connection string , defaults to
                          mongodb://localhost/migrations
  --collection=<name>   Migrations collection, defaults to migrations
  --path=<path>         Where your migrations are stored, defaults to
                          ./migrations
  --silent              Silent mode, defaults to false
```

### Environment variables

Also you can set a such options through environment variable. Just
set MONGOOMIG_<OPTION_NAME_UPPERCASED>. For example,
MONGOOMIG_COLLECTION environment variable is equal to collection
option.

### Config file

Another way is to specify options inside a config. By default,
this package tries to read a config from migrations/config.js. Here is
an example of config:

```js
'use strict';

module.exports = {
  url: 'mongodb://localhost/tiny-blog',
};
```

### API

If you would like to run migrations from your code instead of command
line, you can use the api.

```js
const Migration = require('mongoomig/lib/Migration');

const migration = new Migration({ path, url });
await migration.connect();
await migration.up();
```

A good example is [index.js](index.js) of this package.

## License

Licensed under MIT.
