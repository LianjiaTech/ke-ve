import Vue from 'vue';
import Vuex from 'vuex';
import layout from '@/components/layout/model.js';
import projectCreate from '@/pages/project/create/module';
import projectTask from '@/pages/projectManage/task/model';

Vue.use(Vuex);

const modules = {
  layout,
  projectTask,
  projectCreate
};

const store = new Vuex.Store({ modules });

export default store;
