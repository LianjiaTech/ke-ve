const path = require('path');
const fs = require('fs-extra');
const globby = require('globby');
const express = require('express');
const spawn = require('cross-spawn');
const ssePusher = require('sse-pusher');
const yarnVersions = require('yarn-versions');
const toBemjson = require('md-to-bemjson').convertSync;
const userHome = require('user-home');
const router = express.Router();
const createPush = ssePusher();

const create = require('../../lib/create');
const { renderFile } = require('../../lib/utils/index');
const { installNpm } = require('../../lib/utils/npm');
const projectModel = require('../../lib/model/project');
const pluginModel = require('../../lib/model/pluginInfo');
const templateModel = require('../../lib/model/template');
const { PluginApi, pluginMap } = require('../../lib/pluginApi/index');
const { loadModule } = require('../../lib/utils/module');

router.use(createPush.handler('/sse/create'));

/**
 * 项目列表
 */
router.get('/list', (req, res) => {
  const { projectName = '' } = req.query;
  return res.success({
    list: projectModel.getAll().filter(item => item.name.indexOf(projectName) > -1)
  });
});

/**
 * 创建插件项目
 */
router.post('/plugin/create', (req, res) => {
  req.setTimeout(0); // no timeout

  const { project, config } = req.body;
  if (pluginMap[project.pluginId]) {
    Promise.resolve(
      pluginMap[project.pluginId]({
        projectInfo: project,
        pluginInfo: config,
        push: createPush
      })
    )
      .then(() => {
        // 创建项目时，保存ve的插件信息
        const veFile = `${project.path}/.ke-ve.json`;
        if (!fs.existsSync(veFile)) {
          fs.ensureFileSync(veFile);
          fs.writeJSONSync(veFile, {});
        }
        const veConfig = fs.readJSONSync(veFile);
        veConfig['plugin'] = {
          name: pluginModel.get({ id: project.pluginId }).pkgName,
          config
        };
        fs.writeJSONSync(veFile, veConfig, { spaces: '\t' });

        project.pluginConfig = config;
        project.type = 'create';
        projectModel.add(project);
        res.success();
      })
      .catch(e => {
        res.fail(e.message || e);
      });
  }
});

/**
 * 创建模版项目
 */
router.post('/template/create', (req, res) => {
  const { project, config } = req.body;
  let tplInfo = templateModel.get({ id: project.templateId });
  create(tplInfo.git, project.path, { mode: 'web', meta: config })
    .then(() => {
      projectModel.add(project);
      res.success({ msg: '创建成功' });
    })
    .catch(err => {
      res.fail(err.message);
      console.error(err);
    });
});

/**
 * 项目删除
 */
router.post('/delete', (req, res) => {
  const { id, shouldDelFolder } = req.body;
  if (req.body.id) {
    const info = projectModel.get({ id });
    if (info) {
      projectModel.delete({ id });
      if (shouldDelFolder) {
        fs.removeSync(info.path);
      }
      return res.success('删除成功');
    } else {
      return res.fail(`没有获取项目id为${req.body.id}的数据`);
    }
  } else {
    return res.fail('没有获取到项目id');
  }
});

/**
 * 访达打开
 */
router.post('/openFinder', (req, res) => {
  const { projectPath } = req.body;
  if (projectPath) {
    const { status } = spawn.sync('open', [projectPath], { stdio: 'inherit' });
    if (status === 0) {
      return res.success({ msg: '打开访达成功' });
    } else {
      return res.fail('打开访达失败');
    }
  }
  res.fail('项目路径不能为空');
});

/**
 * 终端打开
 */
router.post('/openTerminal', (req, res) => {
  const { terminal, projectPath } = req.body;

  if (projectPath) {
    const { status } = spawn.sync('open', ['-a', terminal, projectPath], { stdio: 'inherit' });
    if (status === 0) {
      return res.success({ code: 0, msg: '打开终端成功' });
    } else {
      return res.fail('打开终端失败');
    }
  }
  res.fail('项目路径不能为空');
});

/**
 * 编辑器打开
 */
router.post('/openEditor', (req, res) => {
  const { editor, projectPath } = req.body;

  if (projectPath) {
    const { status } = spawn.sync('open', ['-a', editor, projectPath], { stdio: 'inherit' });
    if (status === 0) {
      return res.success({ code: 0, msg: '打开编辑器成功' });
    } else {
      return res.fail('打开编辑器失败');
    }
  }
  res.fail('项目路径不能为空');
});

/**
 * 项目详情
 */
router.get('/detail', (req, res) => {
  if (req.query.id) {
    let info = projectModel.get({ id: req.query.id });
    if (info) {
      info.plugin = pluginModel.get({ id: info.pluginId });
      return res.success(info);
    } else {
      return res.fail(`没有项目id为${req.query.id}的数据`);
    }
  } else {
    return res.fail('没有获取到项目id');
  }
});

/**
 * 更新依赖对象中的版本号
 * @param {Object} dependencies
 * @param {Object} devDependencies
 */
const updateVersion = async (packagePath, dependencies, devDependencies) => {
  const packageLockPath = packagePath.replace(/package.json/, 'package-lock.json');
  const yarnLockPath = packagePath.replace(/package.json/, 'yarn.lock');
  if (fs.existsSync(yarnLockPath)) {
    const yarnLockObj = await yarnVersions.get(yarnLockPath);
    dependencies.forEach(item => {
      item.version = Object.keys(yarnLockObj[item.name])[0];
    });
    devDependencies.forEach(item => {
      item.version = Object.keys(yarnLockObj[item.name])[0];
    });
  } else if (fs.existsSync(packageLockPath)) {
    const pkgLockObj = await fs.readJSON(packageLockPath);

    dependencies.forEach(item => {
      item.version = pkgLockObj.dependencies[item.name].version;
    });
    devDependencies.forEach(item => {
      item.version = pkgLockObj.dependencies[item.name].version;
    });
  }
};

/**
 * 获取项目的package.json
 */
router.get('/pkgs', async (req, res) => {
  try {
    const projectInfo = projectModel.get({ id: req.query.id });
    if (projectInfo.path) {
      const paths = await globby(projectInfo.path, {
        expandDirectories: {
          files: ['package'],
          extensions: ['json']
        },
        ignore: ['**/node_modules/**', '**/components/**']
      });
      const pkgs = paths.map(packagePath => {
        const pkgObj = fs.readJSONSync(packagePath);
        return {
          cwd: path.dirname(packagePath),
          absPath: packagePath,
          scripts: pkgObj.scripts,
          shortPath: packagePath.replace(projectInfo.path, '')
        };
      });
      res.success({ pkgs });
    } else {
      res.fail('获取项目信息失败');
    }
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 获取某个package.json
 */
router.get('/onePkg', async (req, res) => {
  if (req.query.path) {
    try {
      const packagePath = req.query.path;
      const pkgObj = await fs.readJSON(packagePath);
      const dependencies = Object.keys(pkgObj.dependencies || {}).map(name => ({
        name: name,
        version: pkgObj.dependencies[name]
      }));
      const devDependencies = Object.keys(pkgObj.devDependencies || {}).map(name => ({
        name: name,
        version: pkgObj.devDependencies[name]
      }));

      await updateVersion(packagePath, dependencies, devDependencies);

      res.success({
        scripts: pkgObj.scripts,
        dependencies: dependencies,
        devDependencies: devDependencies
      });
    } catch (e) {
      res.fail(e.message || e);
    }
  } else {
    res.fail('缺少参数: path');
  }
});

/**
 * 导入项目
 */
router.post('/import', async (req, res) => {
  const { project } = req.body;
  if (!project) {
    return res.fail('缺少参数: project');
  }

  try {
    const veFile = `${project.path}/.ke-ve.json`;
    if (fs.existsSync(veFile)) {
      const veConfig = fs.readJSONSync(veFile);
      if (veConfig['plugin']) {
        const pluginName = veConfig['plugin'].name;
        let pluginInfo = pluginModel.get({ pkgName: pluginName });
        if (!pluginInfo || !pluginInfo.id) {
          await installNpm(pluginName, { registry: 'ttps://registry.npm.taobao.org' });
          const cliPath = path.resolve(
            userHome,
            `.ke-ve/plugins/node_modules/${pluginName}/cli.js`
          );
          const cliFn = loadModule(cliPath, cliPath, true);
          cliFn(new PluginApi());
          pluginInfo = pluginModel.get({ pkgName: pluginName });
        }
        project.pluginId = pluginInfo.id;
        project.pluginConfig = veConfig['plugin'];
      }
    }
    project.type = 'import';
    projectModel.add(project);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 获取项目中的项目文档README.md
 */
router.get('/readme', async (req, res) => {
  try {
    const projectInfo = projectModel.get({ id: req.query.id });
    if (projectInfo.path) {
      const paths = await globby(projectInfo.path, {
        expandDirectories: {
          files: ['readme', 'README'],
          extensions: ['md']
        },
        ignore: ['**/node_modules/**']
      });
      const readmes = await Promise.all(
        paths.map(async item => {
          const readme = await fs.readFile(item, 'utf-8');
          return {
            cwd: path.dirname(item),
            absPath: item,
            content: readme,
            shortPath: item.replace(projectInfo.path, '')
          };
        })
      );
      res.success({ readmes });
    } else {
      res.fail('获取项目信息失败');
    }
  } catch (err) {
    res.fail(err.message);
  }
});

/**
 * 获取项目的需求文档
 */
router.get('/pmDoc', async (req, res) => {
  try {
    const { id } = req.query;
    const projectInfo = projectModel.get({ id });
    if (projectInfo.path) {
      const docPath = `${projectInfo.path}/.doc`;
      const paths = await globby(docPath, {
        expandDirectories: {
          extensions: ['md']
        }
      });
      const readmes = await Promise.all(
        paths.map(async item => {
          const readme = await fs.readFile(item, 'utf-8');
          return {
            cwd: path.dirname(item),
            absPath: item,
            content: toBemjson(readme).content,
            shortPath: item.replace(docPath, '')
          };
        })
      );
      res.success({ readmes });
    } else {
      res.fail('获取项目信息失败');
    }
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 新建需求文档
 */
router.post('/createPmDoc', async (req, res) => {
  const { id } = req.body;
  const data = { ...req.body.data, createTime: +new Date() };
  try {
    const projectInfo = projectModel.get({ id });
    const paths = path.resolve(__dirname, './../views/doc.ejs');
    await renderFile(paths, { data }, `${projectInfo.path}/.doc/${data.createTime}.md`);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 更新需求文档
 */
router.post('/updatePmDoc', async (req, res) => {
  const { data, id } = req.body;
  try {
    const projectInfo = projectModel.get({ id });
    const paths = path.resolve(__dirname, './../views/doc.ejs');
    await renderFile(paths, { data }, `${projectInfo.path}/.doc/${data.createTime}.md`);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 删除需求文档
 */
router.post('/deletePmDoc', async (req, res) => {
  const { path } = req.body;
  try {
    fs.unlinkSync(path);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 编辑项目文档
 */
router.post('/updateProjectDoc', (req, res) => {
  const { path, content } = req.body;
  try {
    fs.outputFileSync(path, content);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

module.exports = router;
