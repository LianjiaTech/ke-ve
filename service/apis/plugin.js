const express = require('express');
const fs = require('fs-extra');
const userHome = require('user-home');
const path = require('path');
const spawn = require('cross-spawn');

const pluginModel = require('../../lib/model/pluginInfo');
const projectModel = require('../../lib/model/project');
const globalConfigModel = require('../../lib/model/config');
const { searchNpm, queryNpm, uninstallNpm, installNpm } = require('../../lib/utils/npm');
const { PluginApi } = require('../../lib/pluginApi/index');
const FileController = require('../../lib/utils/FileController');
const { loadModule } = require('../../lib/utils/module');

const router = express.Router();

/**
 * 在线插件列表
 * @returns
 * {
 *    list: [
 *       {
 *          name: '插件名称'
 *          desc: '插件描述'
 *          url: 'npm地址'
 *          status: '插件状态（0：未安装 1：已安装）'
 *       }
 *    ]
 * }
 */
router.get('/online/list', async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.fail('缺少参数: keyword');
  }

  try {
    const { objects = [] } = await searchNpm({ keyword: req.query.keyword, size: 20, from: 0 });
    res.success({
      list: objects
        .filter(item => item.package.name.indexOf('ve-cli-') > -1)
        .map(item => {
          return {
            name: item.package.name,
            description: item.package.description,
            version: item.package.version,
            url: `https://www.npmjs.com/package/${item.package.name}`,
            status:
              pluginModel.get({ name: item.package.name }) ||
              pluginModel.get({ pkgName: item.package.name })
                ? 1
                : 0
          };
        })
    });
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 本地插件列表
 * @returns
 * {
 *    list: [
 *       {
 *          id:   '插件id'
 *          name: '插件名称'
 *          desc: '插件描述'
 *          url: 'npm地址'
 *          type: '插件类型（npm）'
 *          path: '插件地址'
 *       }
 *    ]
 * }
 */
router.get('/local/list', (req, res) => {
  const { name = '' } = req.query;
  const projectPlunginIdList = projectModel.getAll().map(item => item.pluginId);
  res.success({
    list: pluginModel
      .getAll()
      .filter(item => item.name.indexOf(name) > -1)
      .map(item => {
        const pkgPath = path.resolve(userHome, `${item.path}/package.json`);
        const pkgObj = fs.readJSONSync(pkgPath, { encoding: 'utf8' });
        return {
          ...item,
          latest: pkgObj.version,
          version: pkgObj.version,
          status: projectPlunginIdList.indexOf(item.id) > -1
        };
      })
  });
});

/**
 * 插件下载
 */
router.post('/download', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.fail('缺少参数：name');
  }

  try {
    await installNpm(name);
    // 下载完成后，判断插件是否cli.js文件
    const cliPath = path.resolve(userHome, `.ke-ve/plugins/node_modules/${name}/cli.js`);
    if (!fs.existsSync(cliPath)) {
      throw new Error('安装失败，当前插件暂无cli文件');
    }
    // 拿到cli暴露的方法, 使用loadModule代替require，解决require缓存问题
    const cliFn = loadModule(cliPath, cliPath, true);

    cliFn(new PluginApi());

    res.success('下载成功');
  } catch (e) {
    console.log(error);
    // 卸载插件
    await uninstallNpm(name);
    res.fail(e.message || e);
  }
});

// 插件删除
router.post('/delete', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.fail('缺少参数: id');
  }

  try {
    const info = pluginModel.get({ id });
    if (info && info.pkgName) {
      await uninstallNpm(info.pkgName);
      pluginModel.delete({ id });
    }
    res.success('删除成功');
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 插件更新
 */
router.post('/update', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.fail('缺少参数: id');
  }

  try {
    const info = pluginModel.get({ id });
    if (info) {
      await installNpm(info.pkgName);
      const cliPath = path.join(info.path + '/cli.js');
      delete require.cache[cliPath];
      const cli = require(cliPath);
      cli(new PluginApi(info.id));

      res.success('更新成功');
    }
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 创建脚手架插件项目：npm、git
 */
router.post('/create', (req, res) => {
  const { fullName, path: projectPath, type, gitUrl, npmUrl, npmName, desc, open } = req.body;
  if (fullName && projectPath && type) {
    const templatePath = path.resolve(__dirname, `../../lib/template/plugin/${type}`);
    const filer = new FileController({
      meta: {
        fullName,
        type,
        gitUrl,
        npmUrl,
        npmName,
        desc
      },
      filters: []
    });
    filer.render(templatePath, projectPath);
    filer
      .resolveFileMiddlewares()
      .then(() => filer.writeFileTree())
      .then(() => {
        if (open) {
          const { editor } = globalConfigModel.getAll();
          const { status } = spawn.sync('open', ['-a', editor, req.body.path], {
            stdio: 'inherit'
          });
          if (status === 0) {
            return res.success();
          } else {
            return res.fail('打开项目失败');
          }
        } else {
          return res.success();
        }
      })
      .catch(e => {
        console.error(e);
        res.fail(e.message || e);
      });
  } else {
    return res.fail('名称和地址必传');
  }
});

/**
 * 获取脚手架npm版本信息
 */
router.get('/versions', (req, res) => {
  const name = req.query.name;
  if (name) {
    const pkgPath = path.resolve(userHome, `${req.query.path}/package.json`);
    const code = fs.readFileSync(pkgPath, { encoding: 'utf8' });
    const pkgObj = JSON.parse(code);
    return queryNpm(name)
      .then(npmData => {
        res.success({
          nowVersion: pkgObj.version,
          latestVersion: npmData['dist-tags'].latest
        });
      })
      .catch(e => {
        console.error(e);
        res.fail(e.message || e);
      });
  } else {
    return res.fail('the parameter of name must be passed');
  }
});

/**
 * 本地插件信息
 */
router.get('/detail', (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.fail('缺少参数: id');
  }

  res.success({
    info: pluginModel.get({ id })
  });
});

module.exports = router;
