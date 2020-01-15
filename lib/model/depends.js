const DB = require('./base');
const low = require('lowdb');
const path = require('path');
const fs = require('fs-extra');
const userHome = require('user-home');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');

let dbFilePath = path.resolve(userHome, '.ke-ve/model/depends.json');
let isFirst = false;

if (!fs.existsSync(dbFilePath)) {
  isFirst = true;
  fs.createFileSync(dbFilePath);
}

const adapter = new FileSync(dbFilePath);
const db = low(adapter);

db._.mixin(lodashId);

/**
 * 数据库字段结构
 * @field id 依赖id唯一性
 * @field name 依赖名称
 * @field description 依赖描述
 * @field latestVersion 依赖最新版本
 */
// Set some defaults
if (isFirst) {
  db.defaults({ data: [], name: 'depends', description: '依赖数据库' }).write();
}

module.exports = new DB(db);
