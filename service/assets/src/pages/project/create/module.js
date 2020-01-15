import { getPluginList, getTplList, createPluginProject, createTemplateProject } from './api';
import { getCurrentPath } from '../api';

function initialState() {
  return {
    rootPath: '', //项目根目录
    project: {
      path: '', // 项目路径
      name: '', // 项目名称
      desc: '', // 项目描述
      rootPath: '' //项目根目录
    },
    checkNameStatus: true,
    pluginList: [],
    tplList: [],
    mode: {
      type: '1',
      plugin: '',
      config: null,
      list: []
    }
  };
}

const app = {
  namespaced: true,
  state: initialState,

  getters: {
    modeSelectList(state) {
      if (state.mode.type == '1') {
        return state.pluginList;
      } else {
        return state.tplList;
      }
    }
  },
  mutations: {
    changeState(state, payload) {
      state = Object.assign(state, payload);
    },
    changeProject(state, payload) {
      state.project = Object.assign(state.project, payload);
    },
    changeMode(state, payload) {
      state.mode = Object.assign(state.mode, payload);
    },
    changeModeConfig(state, payload) {
      state.mode.config = Object.assign(state.mode.config, payload);
    },

    reset(state) {
      const s = initialState();
      Object.keys(s).forEach(key => {
        state[key] = s[key];
      });
    }
  },
  actions: {
    init({ commit }) {
      commit('reset');
      getCurrentPath().then(r => {
        commit('changeProject', { path: r.path, rootPath: r.path });
      });
      getPluginList().then(r => {
        commit('changeState', { pluginList: r.list });
      });

      getTplList().then(r => {
        commit('changeState', { tplList: r.list });
      });
    },
    getModeConfig({ commit, state }, id) {
      if (state.mode.type == '1') {
        let info = state.pluginList.find(item => item.id === id);
        if (info && info.config) {
          let obj = {};
          info.config.forEach(item => {
            if (item.type == 'checkbox') {
              obj[item.name] = item.default ? [item.default] : [];
            } else if (item.type == 'confirm') {
              obj[item.name] = item.default || false;
            } else {
              obj[item.name] = item.default || '';
            }
          });

          commit('changeMode', { config: obj, plugin: id, list: info.config });
        }
      } else {
        let info = state.tplList.find(item => item.id === id);
        if (info && info.meta) {
          let obj = {};
          info.meta.prompts.forEach(item => {
            if (item.type == 'checkbox') {
              obj[item.name] = item.default ? [item.default] : [];
            } else if (item.type == 'confirm') {
              obj[item.name] = item.default || false;
            } else {
              obj[item.name] = item.default || '';
            }
          });

          commit('changeMode', { config: obj, plugin: id, list: info.meta.prompts });
        }
      }
    },

    createProject({ state }) {
      let project = {
        name: state.project.name,
        path: state.project.path,
        desc: state.project.desc,
        rootPath: state.project.rootPath
      };
      if (state.mode.type == '1') {
        project.type = 'plugin';
        project.pluginId = state.mode.plugin;
        return createPluginProject({
          project,
          config: state.mode.config
        });
      } else {
        project.type = 'template';
        project.templateId = state.mode.plugin;
        return createTemplateProject({
          project,
          config: state.mode.config
        });
      }
    }
  }
};

export default app;
