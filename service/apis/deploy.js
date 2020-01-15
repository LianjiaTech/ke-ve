const router = require('express').Router();
const path = require('path');
const fse = require('fs-extra');
const projectModel = require('../../lib/model/project');

/**
 * 获取部署陪住
 */
router.get('/getConfig', async (req, res) => {
  const { projectId, env = 'test' } = req.query;
  if (!projectId) {
    return res.fail('缺少参数: projectId');
  }

  const project = projectModel.get({ id: projectId });
  if (!project) {
    return res.fail('项目未找到');
  }

  const { path: projectPath } = project;
  const veJsonFile = path.resolve(projectPath, '.ke-ve.json');
  if (!fse.existsSync(veJsonFile)) {
    return res.success({ deploy: {} });
  }

  try {
    const data = await fse.readJson(veJsonFile);
    if (data.deploy && data.deploy[`${env}`]) {
      return res.success({ deploy: data.deploy[`${env}`] });
    }
    res.success({ deploy: {} });
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 保存部署配置
 */
router.post('/saveConfig', async (req, res) => {
  const { projectId, deploy = {}, env = 'test' } = req.body;
  if (!projectId) {
    return res.fail('缺少参数: projectId');
  }

  const project = projectModel.get({ id: projectId });
  if (!project) {
    return res.fail('项目未找到');
  }

  try {
    const { path: projectPath } = project;
    const veJsonFile = path.resolve(projectPath, '.ke-ve.json');
    if (!fse.existsSync(veJsonFile)) {
      fse.ensureFileSync(veJsonFile);
      fse.writeJSONSync(veJsonFile, {});
    }

    const data = await fse.readJson(veJsonFile);
    let envDeploy = { test: deploy };
    if (env !== 'test') {
      envDeploy = { prod: deploy };
    }
    await fse.writeJson(
      veJsonFile,
      { ...data, deploy: { ...data.deploy, ...envDeploy } },
      { spaces: '\t' }
    );
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

module.exports = router;
