import Vue from 'vue';
import Main from './main.vue';
let TerminalConstructor = Vue.extend(Main);

let instance;

const Terminal = function(options = {}) {
  if (Vue.prototype.$isServer) return;
  if (instance) {
    instance.visible = !instance.visible;
    return;
  }

  options.delInstance = () => instance = null;
  instance = new TerminalConstructor({
    data: options
  });

  instance.$mount();
  document.body.appendChild(instance.$el);

  return instance;
}

Terminal.install = function (Vue) {
  Vue.prototype.$terminal = Terminal;
}

export default Terminal;