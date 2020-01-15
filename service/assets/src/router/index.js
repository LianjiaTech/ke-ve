import Vue from 'vue';
import VueRouter from 'vue-router';
import projectLayout from '@/pages/projectManage/layout/index';

Vue.use(VueRouter);

const _import = file => import('@/pages/' + file + '.vue');

export const routes = [
  {
    path: '/',
    name: 'home',
    redirect: 'plugin',
    component: () => _import('home/index'),
    children: [
      {
        path: 'select',
        name: 'select',
        meta: { title: '项目列表', icon: 'dashboard' },
        component: () => _import('project/list/index')
      },
      {
        path: 'create',
        name: 'create',
        meta: { title: '创建项目', icon: 'dashboard' },
        component: () => _import('project/create/index')
      },
      {
        path: 'import',
        name: 'import',
        meta: { title: '导入项目', icon: 'dashboard' },
        component: () => _import('project/import/index')
      },
      {
        path: 'plugin',
        name: 'plugin',
        meta: { title: '插件列表', icon: 'component' },
        component: () => _import('home/plugin/list')
      },
      {
        path: 'plugin/create',
        name: 'pluginCreate',
        meta: { title: '插件列表', icon: 'component' },
        component: () => _import('home/plugin/create')
      },
      {
        path: 'template',
        name: 'template',
        meta: { title: '模板列表', icon: 'component' },
        component: () => _import('home/template/index')
      },
      {
        path: 'template/create',
        name: 'templateCreate',
        meta: { title: '模板列表', icon: 'component' },
        component: () => _import('home/template/create')
      }
    ]
  },

  {
    path: '/project/:id',
    name: 'project',
    component: projectLayout,
    children: [
      {
        path: 'config',
        name: 'config',
        hidden: true,
        component: () => _import('projectManage/config/index')
      },
      {
        path: 'doc',
        name: 'doc',
        hidden: true,
        component: () => _import('projectManage/doc/index')
      },
      {
        path: 'depend',
        name: 'depend',
        hidden: true,
        component: () => _import('projectManage/depend/index')
      },
      {
        path: 'task',
        name: 'task',
        hidden: true,
        component: () => _import('projectManage/task/index')
      },
      {
        path: 'deploy',
        name: 'deploy',
        component: () => _import('projectManage/deploy/index')
      },
      {
        path: 'code',
        name: 'code',
        component: () => _import('projectManage/code/index')
      }
    ]
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  const { path: fromPath } = from;
  const { path: toPath } = to;
  const lastActivePath = window.localStorage.getItem('lastActivePath');
  if (fromPath === '/' && toPath.indexOf('/project/') === -1 && toPath !== lastActivePath) {
    next({ path: lastActivePath });
  } else {
    next();
  }
});

export default router;
