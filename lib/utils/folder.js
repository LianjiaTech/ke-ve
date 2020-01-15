const path = require('path');
const fs = require('fs-extra');
const winattr = require('@akryum/winattr');

const cwd = process.cwd();
const hiddenPrefix = '.';
const isPlatformWindows = process.platform.indexOf('win') === 0;
const pkgCache = new Map();

/**
 * 判断是否是文件夹
 * @param {string} file 文件路径
 */
function isDirectory(file) {
  file = file.replace(/\\/g, path.sep);
  try {
    return fs.statSync(file).isDirectory();
  } catch (e) {
    console.warn(e.message);
  }
  return false;
}
/**
 * 获取目录下的所有文件夹
 * @param {string} base 目录路径
 */
async function list(base = cwd) {
  let dir = base;
  if (isPlatformWindows) {
    if (base.match(/^([A-Z]{1}:)$/)) {
      dir = path.join(base, '\\');
    }
  }
  const files = await fs.readdir(dir, 'utf8');
  return files
    .map(file => {
      const folderPath = path.join(base, file);
      return {
        path: folderPath,
        name: file,
        hidden: isHidden(folderPath)
      };
    })
    .filter(file => isDirectory(file.path));
}
/**
 * 隐藏掉..、.*和node_modules等特殊的文件
 * @param {*} file
 */
function isHidden(file) {
  try {
    const prefixed = path.basename(file).charAt(0) === hiddenPrefix;
    const result = {
      unix: prefixed,
      windows: false,
      nodeModules: path.basename(file) === 'node_modules'
    };

    if (isPlatformWindows) {
      const windowsFile = file.replace(/\\/g, '\\\\');
      result.windows = winattr.getSync(windowsFile).hidden;
    }

    return (
      (!isPlatformWindows && result.unix) ||
      (isPlatformWindows && result.windows) ||
      result.nodeModules
    );
  } catch (e) {
    console.log('file:', file);
    console.error(e);
  }
}

/**
 * 删除文件夹
 * @param {string} file 文件路径
 */
function deleteFolder(file) {
  fs.removeSync(file);
}
/**
 * 创建文件夹
 * @param {string} file 文件路径
 * @param {string} name 文件夹名称
 */
function createFolder(filepath, name) {
  let file = path.join(filepath, name);
  fs.mkdirpSync(file);
  return {
    name: path.basename(file),
    path: file
  };
}

/**
 * 获取父级文件夹下的所有文件夹
 * @param {string} file 文件路径
 */
function openParent(file = cwd) {
  const newFile = path.dirname(file);
  return list(newFile);
}
/**
 * 获取当前路径
 * @param {*} file
 */
function getCurrent(file = cwd) {
  return {
    name: path.basename(file),
    path: file
  };
}

function getParent(file = cwd) {
  const newFile = path.dirname(file);
  return {
    name: path.basename(newFile),
    path: newFile
  };
}

function readPackage(file, force = false) {
  if (!force) {
    const cachedValue = pkgCache.get(file);
    if (cachedValue) {
      return cachedValue;
    }
  }
  const pkgFile = path.join(file, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = fs.readJsonSync(pkgFile);
    pkgCache.set(file, pkg);
    return pkg;
  }
}

module.exports = {
  isDirectory,
  list,
  deleteFolder,
  createFolder,
  openParent,
  getCurrent,
  getParent,
  readPackage
};
