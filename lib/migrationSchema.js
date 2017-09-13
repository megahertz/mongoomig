'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  completed: { type: Boolean, default: false },
  date:      { type: Date, default: Date.now },
  name:      String,
});

schema.statics = {
  ...schema.statics,

  async addRecord(migrationName) {
    try {
      let record = await this.findOne({ name: migrationName });
      if (!record) {
        record = new this({ name: migrationName });
      }

      await record.save();
      return record;
    } catch (e) {
      e.message = `Couldn't save migration record to mongodb: ${e.message}`;
      throw e;
    }
  },

  /**
   * @return {Promise<MigrationModel>}
   */
  async findLatest() {
    return this.findOne({ completed: true }).sort('-name').exec();
  },

  /**
   * Return all records newer or equal to downTo
   * @param {string} downTo
   * @return {Promise<MigrationModel[]>}
   */
  async findDownTo(downTo) {
    const condition = downTo ? { name: { $gte: downTo } } : {};

    const query = this
      .find({
        ...condition,
        completed: true,
      })
      .sort('-name');
    const records = await query.exec();

    const record = records.find(r => r.name === downTo);
    if (downTo && !record) {
      throw new Error(`Migration record ${downTo} not found in the collection`);
    }

    return records;
  },

  /**
   * Return list of migrations which are not executed yet
   * @param {string[]} migrations
   * @param {string} upTo Skip all newer than upTo migrations
   * @return {Promise<string[]>}
   */
  async filterForMigrateUp(migrations, upTo) {
    if (upTo) {
      migrations = migrations.filter(m => m <= upTo);
    }

    const latest = await this.findLatest();
    return migrations
      .filter(m => latest ? latest.name < m : true)
      .sort();
  },

  async list() {
    return this.find().sort('name');
  },
};

schema.virtual('status').get(function getStatus() {
  return this.completed ? 'Completed' : 'Failed';
});

module.exports = schema;
