const DB = require('./base');
const low = require('lowdb');
const path = require('path');
const fs = require('fs-extra');
const userHome = require('user-home');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');

let dbFilePath = path.resolve(userHome, '.ke-ve/model/project.json');
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
 * @field id  项目id唯一性
 * @field name 项目名称
 * @field desc 项目描述
 * @field path 项目绝对路径
 * @field rootPath 项目所在根目录
 * @field pluginId 插件id
 * @field pluginConfig 插件配置
 * @field deploy 部署信息
 * @field type 项目类型 create/import
 */
// Set some defaults
if (isFirst) {
  db.defaults({ data: [], name: 'project', description: '项目数据库' }).write();
}

module.exports = new DB(db);
