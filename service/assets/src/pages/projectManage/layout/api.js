import axios from '@/utils/api';

// 打开终端
export function openTerminal(query = {}) {
  return axios({
    url: '/api/project/openTerminal',
    method: 'post',
    data: query
  });
}

// 打开编辑器
export function openEditor(query = {}) {
  return axios({
    url: '/api/project/openEditor',
    method: 'post',
    data: query
  });
}

// 打开访达
export function openFinder(query = {}) {
  return axios({
    url: '/api/project/openFinder',
    method: 'post',
    data: query
  });
}

// 获取全局配置
export function getGlobalConfig(query = {}) {
  return axios({
    url: '/api/gconfig/detail',
    method: 'get',
    params: query
  });
}

// 更新全局配置
export function updateGlobalConfig(query = {}) {
  return axios({
    url: '/api/gconfig/update',
    method: 'post',
    data: query
  });
}

// 获取项目的脚手架插件信息
export function getPluginDetail(query = {}) {
  return axios({
    url: '/api/plugin/detail',
    method: 'get',
    params: query
  });
}
