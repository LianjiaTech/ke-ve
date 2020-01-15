const opn = require('better-opn');

const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');

class OpenBrowserPlugin {
  constructor() {
    this.open = false;
  }
  apply(compiler) {
    compiler.hooks.done.tap('OpenBrowserPlugin', () => {
      if (!this.open) {
        this.open = true;
        opn('http://localhost:9729');
      }
    });
  }
}
module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  devtool: 'source-map',
  watch: true,
  watchOptions: {
    poll: true
  },

  plugins: [new OpenBrowserPlugin()]
});
