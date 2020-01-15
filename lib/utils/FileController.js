/**
 * 文件处理器
 */
const path = require('path');
const fs = require('fs-extra');
const globby = require('globby');
const isBinary = require('isbinaryfile');
const ejs = require('ejs');
const slash = require('slash');

const isString = val => typeof val === 'string';
const isFunction = val => typeof val === 'function';
const isObject = val => val && typeof val === 'object';

class FileController {
  constructor(options = {}) {
    this.files = {}; // key:文件路径，value：{source: 文件内容，dir：文件地址}
    this.fileMiddlewares = []; // 处理文件的中间件
    this.options = options;
  }

  _resolveData(additionalData) {
    return Object.assign({}, this.options, additionalData);
  }

  _injectFileMiddleware(middleware) {
    this.fileMiddlewares.push(middleware);
  }

  async resolveFileMiddlewares() {
    const files = this.files;
    for (let middleware of this.fileMiddlewares) {
      await middleware(files);
    }

    Object.keys(files).forEach(file => {
      const normalized = slash(file);
      if (file !== normalized) {
        files[normalized] = files[file];
        delete files[file];
        files[normalized].dir = slash(files[normalized].dir);
      }
    });
  }

  /**
   * 渲染模板
   */
  render(source, dist, additionalData = {}, ejsOptions) {
    if (!dist) {
      console.error('render has not dist params');
    }

    const baseDir = extractCallDir();
    if (isString(source)) {
      source = path.resolve(baseDir, source);
      this._injectFileMiddleware(async files => {
        let data = this._resolveData(additionalData);
        let _files = await globby(['**/.*', '**/*'], {
          cwd: source,
          ignore: this.options.filters
        });

        for (let rawPath of _files) {
          let filename = path.basename(rawPath);

          if (filename.charAt(0) === '_' && filename.charAt(1) !== '_') {
            filename = `.${filename.slice(1)}`;
          }

          const targetPath = path.join(path.dirname(rawPath), filename);
          const sourcePath = path.resolve(source, rawPath);
          const content = renderFile(sourcePath, data, ejsOptions);

          if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
            files[targetPath] = {
              source: content,
              dir: dist
            };
          }
        }
      });
    } else if (isObject(source)) {
      this._injectFileMiddleware(files => {
        const data = this._resolveData(additionalData);
        for (const targetPath in source) {
          const sourcePath = path.resolve(baseDir, source[targetPath]);
          const content = renderFile(sourcePath, data, ejsOptions);
          if (Buffer.isBuffer(content) || content.trim()) {
            files[targetPath] = {
              source: content,
              dir: dist
            };
          }
        }
      });
    } else if (isFunction(source)) {
      this._injectFileMiddleware(source);
    }
  }
  /**
   * 渲染
   * @param {*} file
   * @param {*} data
   * @param {*} ejsOptions
   */
  renderToString(file, data, ejsOptions) {
    return renderFile(file, data, ejsOptions);
  }

  writeFileTree(files) {
    if (!files) files = this.files;

    return Promise.all(
      Object.keys(files).map(async name => {
        let filePath = path.resolve(process.cwd(), files[name].dir, name);
        if (path.isAbsolute(files[name].dir)) {
          filePath = path.resolve(files[name].dir, name);
        }
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, files[name].source);
      })
    );
  }
}

module.exports = FileController;

function extractCallDir() {
  // extract api.render() callsite file location using error stack
  const obj = {};
  Error.captureStackTrace(obj);
  const callSite = obj.stack.split('\n')[3];
  const fileName = callSite.match(/\s\((.*):\d+:\d+\)$/)[1];
  return path.dirname(fileName);
}

function renderFile(name, data, ejsOptions) {
  if (isBinary.isBinaryFileSync(name)) {
    return fs.readFileSync(name); // return buffer
  }

  let source = fs.readFileSync(name, 'utf-8');

  return ejs.render(source, data, ejsOptions);
}
