export default {
  namespaced: true,
  state: {
    isCollapse: false
  },

  mutations: {
    setCollapse: (state, isCollapse) => {
      state.isCollapse = isCollapse;
    }
  },

  actions: {}
};
