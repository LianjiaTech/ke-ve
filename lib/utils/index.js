const ejs = require('ejs');
const fs = require('fs-extra');

/**
 * 渲染模板数据并生成文件
 * @param {string} tpl 模板地址
 * @param {object} data 模板数据
 * @param {string} filePath 生成的文件地址
 * @param {object} ejsOptions ejs参数
 */
exports.renderFile = function renderFile(tpl, data, filePath, ejsOptions) {
  let source = fs.readFileSync(tpl, 'utf-8');
  let content = ejs.render(source, data, Object.assign({ rmWhitespace: true }, ejsOptions));

  if (fs.existsSync(filePath)) fs.removeSync(filePath);
  return fs.outputFile(filePath, content);
};
