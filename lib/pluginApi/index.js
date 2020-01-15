const fs = require('fs-extra');
const uuidv4 = require('uuid/v4');
const userHome = require('user-home');
const validate = require('schema-utils');
const pluginInfoDb = require('../model/pluginInfo');

const pluginMap = {};

const schema = {
  type: 'object',
  properties: {
    config: { type: 'array' },
    url: { type: 'string', minLength: 1 },
    desc: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    pkgName: { type: 'string', minLength: 1 },
    type: {
      type: 'string',
      enum: ['npm', 'custom']
    }
  },
  required: ['name', 'pkgName'],
  additionalProperties: true
};

// 注册插件基本信息和配置信息
class PluginApi {
  constructor(id) {
    this.id = id || uuidv4();
  }
  registerPluginInfo(infoObj = {}) {
    infoObj.type = infoObj.type || 'npm';
    infoObj.config = infoObj.config || [];
    validate(schema, infoObj);
    if (infoObj.type === 'custom' && !infoObj.depend) {
      // type=custom时 必须传depend
      throw Error('depend is required when the type is custome');
    }
    if (infoObj.config.length) {
      // 检查插件的配置，不符合条件直接抛错
      infoObj.config.forEach(item => {
        ['name', 'type'].forEach(key => {
          if (!item[key]) throw Error(`${key} is required`);
        }); // 必填项
        if (['checkbox', 'list'].includes(item.type) && !item.choices) {
          throw Error('choices is required when the type is checkbox or list');
        } //type=checkbox或list时，必须要有choices
      });
    }
    let path = userHome + `/.ke-ve/plugins/node_modules/${infoObj.pkgName}`;
    if (infoObj.type === 'custom') {
      path = userHome + `/.ke-ve/plugins/${infoObj.pkgName}`;
    }
    const data = { ...infoObj, id: this.id, path };
    // 判断插件是否已经存在，如果存在，则更新，否则新增
    const res = pluginInfoDb.get({ id: this.id });
    if (!res) {
      pluginInfoDb.add(data);
    } else {
      pluginInfoDb.update({ id: this.id }, data);
    }
  }
  registerGenerate(callback) {
    pluginMap[this.id] = callback;
  }
}

/**
 * 加载本地脚手架插件
 */
function loadLocalPlugin() {
  let pluginsData = pluginInfoDb.getAll();
  if (pluginsData.length > 0) {
    pluginsData.forEach(plugin => {
      if (fs.existsSync(plugin.path)) {
        let cli = require(plugin.path + '/cli.js');
        cli(new PluginApi(plugin.id));
      } else {
        console.warn(`没有找到${plugin.name}插件，已经从数据库删除`);
        pluginInfoDb.delete(plugin);
      }
    });
  } else {
    // console.warn('本地还没有安装脚手架插件');
  }
}

module.exports = {
  PluginApi,
  pluginMap,
  loadLocalPlugin
};
