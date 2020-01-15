const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const spawn = require('cross-spawn');
const userHome = require('user-home');

/**
 * npm包安装工具
 */
const npmManager = cmd => async (name, options) => {
  if (!name) {
    return;
  }

  options = {
    ...{
      dev: false,
      quiet: false,
      npm: 'npm',
      registry: null,
      cwdPath: ''
    },
    ...options
  };

  const cwdPath = options.cwdPath ? options.cwdPath : path.resolve(userHome, '.ke-ve/plugins');
  if (!fs.existsSync(cwdPath)) {
    fs.mkdir(cwdPath);
  }

  if (!fs.existsSync(`${cwdPath}/package.json`)) {
    console.info('Initialing packge.json');

    const output = spawn('npm', ['init', '-y', '--silent'], {
      cwd: cwdPath,
      stdio: 'inherit'
    });

    await new Promise((resolve, reject) => {
      output.on('close', function(code) {
        if (code !== 0) {
          console.error('npm init failed');
          return reject('npm init failed');
        } else {
          console.log('npm init successfully');
          return resolve('npm init successfully');
        }
      });
    });
  }

  const args = [cmd, name];
  args.push(options.dev ? '--save-dev' : '--save');
  args.push('--prefix ' + cwdPath);
  if (options.quiet) {
    args.push('--silent', '--no-progress');
  }
  if (options.registry) {
    args.push('--registry=' + options.registry);
  }

  console.info('%s %s...', cmd, name);

  const output = spawn(options.npm, args, {
    cwd: cwdPath,
    stdio: 'inherit'
  });

  return new Promise((resolve, reject) => {
    output.on('close', function(code) {
      if (code !== 0) {
        console.error(`npm ${args.join(' ')} failed`);
        return reject(`npm ${args.join(' ')} failed`);
      } else {
        console.log(`npm ${args.join(' ')} successfully`);
        return resolve(`npm ${args.join(' ')} successfully`);
      }
    });
  });
};

exports.installNpm = npmManager('install');
exports.uninstallNpm = npmManager('uninstall');

/**
 * 搜索npmjs上的包信息
 */
exports.searchNpm = function({ keyword, size, from }) {
  return axios
    .get(`http://registry.npmjs.com/-/v1/search?text=${keyword}&size=${size}&from=${from}`)
    .then(res => {
      const { status, data } = res;
      if (status === 200) {
        return data;
      } else {
        throw new Error(`请求失败: ${status}`);
      }
    });
};

/**
 * 获取npm包的准确信息
 */
exports.queryNpm = function(name) {
  return axios.get(`http://registry.npmjs.com/${name}`).then(res => {
    const { status, data } = res;
    if (status === 200) {
      return data;
    } else {
      throw new Error(`请求失败: ${status}`);
    }
  });
};
