const DB = require('./base');
const low = require('lowdb');
const path = require('path');
const fs = require('fs-extra');
const userHome = require('user-home');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');

let dbFilePath = path.resolve(userHome, '.ke-ve/model/prompts.json');
let isFirst = false;

if (!fs.existsSync(dbFilePath)) {
  isFirst = true;
  fs.createFileSync(dbFilePath);
}

const adapter = new FileSync(dbFilePath);
const db = low(adapter);

db._.mixin(lodashId);

// Set some defaults
if (isFirst) {
  db.defaults({ data: [], name: 'prompts', description: '项目模板prompts数据' }).write();
}

module.exports = new DB(db);
