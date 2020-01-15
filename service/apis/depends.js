const router = require('express').Router();
const { searchNpm, queryNpm, uninstallNpm, installNpm } = require('../../lib/utils/npm');
const dependsModel = require('../../lib/model/depends');

/**
 * 获取单个依赖的信息
 */
router.get('/info', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.fail('缺少参数: name');
  }

  // 获取最新的npm包信息，更新到数据库
  const updateDepends = async isNew => {
    const data = await queryNpm(name);
    const npmInfos = {
      name,
      description: data.description,
      latestVersion: data['dist-tags'].latest
    };
    if (isNew) {
      dependsModel.add(npmInfos);
    } else {
      dependsModel.update({ name }, npmInfos);
    }

    return npmInfos;
  };

  try {
    let npmInfos = dependsModel.get({ name });
    if (!npmInfos) {
      npmInfos = await updateDepends(true);
      res.success({ npmInfos });
    } else {
      res.success({ npmInfos });
      await updateDepends(false);
    }
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 获取在线依赖列表
 */
router.get('/list', async (req, res) => {
  const { keyword, pageSize = 5, page = 1 } = req.query;
  if (!keyword) {
    return res.fail('缺少参数: keyword');
  }

  try {
    const { objects = [], total = 0 } = await searchNpm({
      keyword,
      size: pageSize,
      from: (page - 1) * pageSize
    });
    res.success({
      list: objects.map(({ package = {} }) => ({
        name: package.name,
        logo: `https://avatars.dicebear.com/v2/identicon/${package.name}.svg`,
        url: `https://www.npmjs.com/package/${package.name}`,
        description: package.description
      })),
      total
    });
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 更新本地依赖
 */
router.post('/update', async (req, res) => {
  const { name, option = {} } = req.body;
  if (!name) {
    return res.fail('缺少参数: name');
  }

  try {
    await installNpm(name, option);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

/**
 * 删除本地依赖
 */
router.post('/delete', async (req, res) => {
  const { name, option = {} } = req.body;
  if (!name) {
    return res.fail('缺少参数: name');
  }

  try {
    await uninstallNpm(name, option);
    res.success();
  } catch (e) {
    res.fail(e.message || e);
  }
});

module.exports = router;
