import axios from '@/utils/api';

// 获取本地插件列表
export function getPluginList(query = {}) {
  return axios({
    url: '/api/plugin/local/list',
    method: 'get',
    data: query
  });
}

// 获取本地模板列表
export function getTplList(query = {}) {
  return axios({
    url: '/api/template/list',
    method: 'get',
    data: query
  });
}

// 创建脚手架插件项目
export function createPluginProject(query = {}) {
  return axios({
    url: '/api/project/plugin/create',
    method: 'post',
    data: query
  });
}

// 创建脚手架模板项目
export function createTemplateProject(query = {}) {
  return axios({
    url: '/api/project/template/create',
    method: 'post',
    data: query
  });
}
