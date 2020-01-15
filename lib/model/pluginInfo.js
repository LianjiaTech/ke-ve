const DB = require('./base');
const low = require('lowdb');
const path = require('path');
const fs = require('fs-extra');
const userHome = require('user-home');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');

let dbFilePath = path.resolve(userHome, '.ke-ve/model/pluginInfo.json');
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
 * @field id  插件id唯一性
 * @field url 插件npm链接地址
 * @field name 脚手架名称
 * @field pkgName 脚手架插件名称
 * @field desc 插件描述
 * @field config 插件配置信息
 * @field path 插件绝对路径
 * @field type 插件类型，是自定义插件npm还是ve自动生成的插件custom
 * @field depend 如果是custom，则表示此插件依赖的node包名称
 */
// Set some defaults
if (isFirst) {
  db.defaults({ data: [], name: 'plugin', description: '插件数据库' }).write();
}

module.exports = new DB(db);
