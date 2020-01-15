import Vue from 'vue';
import vueNcform from '@ncform/ncform';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ncformStdComps from '@ncform/ncform-theme-elementui';

import './assets/styles/index.less'; // global css

import App from './App.vue';
import router from './router';
import store from './store';

import * as filters from './filters'; // global filters
import Terminal from './components/Terminal/main.js';
import io from 'socket.io-client';

Vue.use(ElementUI);
Vue.use(Terminal);
Vue.use(vueNcform, { extComponents: ncformStdComps });

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});

const reloadIo = io(window.location.origin + '/reload');
reloadIo.on('reload', () => {
  window.location.reload();
});
