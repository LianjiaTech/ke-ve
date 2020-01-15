const router = require('express').Router();
const path = require('path');
const fse = require('fs-extra');
const projectModel = require('../../lib/model/project');
const pluginModel = require('../../lib/model/pluginInfo');
const { loadModule } = require('../../lib/utils/module');

/**
 * class：注入到项目自定义配置中的api对象
 */
class ConfigAPI {
  constructor() {
    this.getConfigFn = async () => {};
    this.saveConfigFn = async () => {};
  }
  registerGetConfig(fn) {
    this.getConfigFn = fn;
  }
  registerSaveConfig(fn) {
    this.saveConfigFn = fn;
  }
}

/**
 * 获取自定义配置项
 */
router.get('/getConfig', async (req, res) => {
  const { projectId } = req.query;
  if (!projectId) {
    return res.fail('缺少参数: projectId');
  }

  const project = projectModel.get({ id: projectId });
  if (!project) {
    return res.fail('项目未找到');
  }

  const { pluginId } = project;
  const plugin = pluginModel.get({ id: pluginId });
  if (!plugin) {
    return res.fail('脚手架插件未找到', 404);
  }

  const { path: pluginPath } = plugin;
  const configFile = path.resolve(pluginPath, 'config.js');
  if (!fse.existsSync(configFile)) {
    return res.fail('没有找到对应的配置文件');
  }

  try {
    const configApi = new ConfigAPI();
    loadModule(configFile, configFile, true)(configApi);
    const data = await configApi.getConfigFn({ projectInfo: { ...project } });
    res.success({ ...data });
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 保存配置
 */
router.post('/saveConfig', async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) {
    return res.fail('缺少参数: projectId');
  }

  const project = projectModel.get({ id: projectId });
  if (!project) {
    return res.fail('项目未找到');
  }

  const { pluginId } = project;
  const plugin = pluginModel.get({ id: pluginId });
  if (!plugin) {
    return res.fail('脚手架插件未找到', 404);
  }

  const { path: pluginPath } = plugin;
  const configFile = path.resolve(pluginPath, 'config.js');
  if (!fse.existsSync(configFile)) {
    return res.fail('没有找到对应的配置文件');
  }

  try {
    const { key = '', option = {} } = req.body;
    const configApi = new ConfigAPI();
    loadModule(configFile, configFile, true)(configApi);
    await codeApi.saveConfigFn({
      configInfo: { key, option },
      projectInfo: { ...project }
    });
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

module.exports = router;
