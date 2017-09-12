'use strict';

const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { resolve } = require('path');

module.exports = createMigration;

function createMigration(migrationPath, name) {
  if (!existsSync(migrationPath)) {
    mkdirSync(migrationPath);
  }

  let fileName = resolve(migrationPath, makeMigrationName(name) + '.js');
  writeFileSync(fileName, TEMPLATE, 'utf8');
  return fileName;
}

function makeMigrationName(name) {
  const pad2 = n => n < 10 ? '0' + n : n;
  const date = new Date();

  let migrationName = [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
    '-',
    pad2(date.getHours()),
    pad2(date.getMinutes()),
  ].join('');

  if (name && name.length > 0) {
    migrationName += '-' + name;
  }

  return migrationName;
}

const TEMPLATE = `'use strict';

module.exports = {
  up() {
    
  },

  down() {
    
  },
};
`;
