const path = require('path');
const fs = require('fs-extra');
const home = require('user-home');
const exists = require('fs').existsSync;
const Generator = require('./Generator');

async function add(template, args) {
  const templateRoot = path.join(home, '.ke-ve/components');
  const baseDir = path.resolve(process.cwd());

  // 创建本地缓存文件夹
  if (!exists(templateRoot)) {
    await fs.ensureDir(templateRoot);
  }

  const ga = new Generator({
    template: template,
    projectPath: baseDir,
    mode: 'cmd',
    args
  });

  await ga.download();

  await ga.create();
}

module.exports = (...args) => {
  return add(...args).catch(err => {
    console.log(err);
    process.exit(1);
  });
};
