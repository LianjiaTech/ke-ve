import { getProjectPkgs } from '../api';
export default {
  namespaced: true,
  state: {
    pkgs: []
  },
  mutations: {
    updateState(state, payload) {
      state = Object.assign(state, payload);
    },

    updateStatus(state, payload) {
      state.pkgs[payload.activeIndex].scripts[payload.subactiveIndex].status = payload.status;
    }
  },
  actions: {
    init({ commit }, id) {
      return getProjectPkgs({ id }).then(res => {
        if (res.pkgs && res.pkgs.length) {
          let pkgs = res.pkgs.map(pkg => {
            if (pkg.scripts) {
              Object.keys(pkg.scripts).forEach(key => {
                pkg.scripts[key] = {
                  command: pkg.scripts[key],
                  status: 'init'
                }
              })
            }
            return pkg;
          });
          commit('updateState', { pkgs: pkgs });
        }
        
        return res.pkgs;
      });
    }
  }
};
