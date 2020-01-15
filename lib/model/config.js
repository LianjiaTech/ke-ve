const low = require('lowdb');
const path = require('path');
const fs = require('fs-extra');
const userHome = require('user-home');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');

let dbFilePath = path.resolve(userHome, '.ke-ve/model/config.json');
let isFirst = false;

if (!fs.existsSync(dbFilePath)) {
  isFirst = true;
  fs.createFileSync(dbFilePath);
}

const adapter = new FileSync(dbFilePath);
const db = low(adapter);

db._.mixin(lodashId);

const defaultData = {
  terminal: 'webTerminal', // 终端
  editor: 'Visual Studio Code', // 编辑器
  customEditorCommand: '' // 自定义编辑器启动脚本
};
class DB {
  constructor(db) {
    this.db = db;
  }
  get(key) {
    return this.db.get(`data.${key}`).value();
  }
  getAll() {
    return this.db.get('data').value();
  }
  set(key, value) {
    this.db.set(`data.${key}`, value).write();
  }
  update(obj) {
    const data = this.db.get('data').value();
    const newData = Object.assign({}, data, obj);
    this.db.set('data', newData).write();
  }
  reset() {
    return this.db.set('data', defaultData).write();
  }
}

// Set some defaults
if (isFirst) {
  db.defaults({ data: defaultData, name: 'config', description: '配置数据' }).write();
}

module.exports = new DB(db);
