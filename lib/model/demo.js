const path = require('path');
const fs = require('fs-extra');
const userHome = require('user-home');
const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const DB = require('./base');

let dbFilePath = path.resolve(userHome, '.ke-ve/model/demo.json');

if (!fs.existsSync(dbFilePath)) fs.createFileSync(dbFilePath);

const adapter = new FileSync(dbFilePath);
const db = low(adapter);

db._.mixin(lodashId);

/**
 * 数据库字段结构
 * @field id 唯一性id
 * @field name 名称
 */
// Set some defaults
db.defaults({ data: [], name: 'demo', description: 'demo 数据库' }).write();

module.exports = new DB(db);
