const { PluginApi, pluginMap } = require('./index');
const pluginModel = require('../model/pluginInfo');

describe('cli api method', () => {
  afterEach(() => {
    pluginModel.delete({ name: 'test1' });
    pluginModel.delete({ name: 'test2' });
  });

  test('cli api registerPluginInfo', () => {
    const api = new PluginApi();

    api.registerPluginInfo({ name: 'test1' });

    let info = pluginModel.get({ name: 'test1' });

    expect(!!info).toBe(true);
  });

  test('cli api registerGenerate', () => {
    const api = new PluginApi();

    api.registerPluginInfo({ name: 'test2' });

    let callback = function() {
      console.log('qqqqqqq');
    };
    api.registerGenerate(callback);

    let info = pluginModel.get({ name: 'test2' });

    expect(pluginMap[info.id]).toEqual(callback);
  });
});
