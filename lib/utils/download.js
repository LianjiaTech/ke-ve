const fs = require('fs-extra');
const clone = require('git-clone');

/**
 * 下载gitlab模板
 */
module.exports = (repo, dest) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) fs.removeSync(dest);

    clone(repo, dest, function(err) {
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
};
