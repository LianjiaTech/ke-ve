import axios from '@/utils/api';

export function getLocalList(query = {}) {
  return axios({
    url: '/api/plugin/local/list',
    method: 'get',
    params: query
  });
}

export function getOnlineList(query = {}) {
  return axios({
    url: '/api/plugin/online/list',
    method: 'get',
    params: query
  });
}

export function updatePlugin(query = {}) {
  return axios({
    url: '/api/plugin/update',
    method: 'post',
    data: query
  });
}

export function downloadPlugin(query = {}) {
  return axios({
    url: '/api/plugin/download',
    method: 'post',
    data: query
  });
}

export function delPlugin(query = {}) {
  return axios({
    url: '/api/plugin/delete',
    method: 'post',
    data: query
  });
}

export function getCurrentPath(query = {}) {
  return axios({
    url: '/api/folder/currentPath',
    method: 'get',
    params: query
  });
}

export function createPluginProject(query = {}) {
  return axios({
    url: '/api/plugin/create',
    method: 'post',
    data: query
  });
}

export function getPluginVersions(query = {}) {
  return axios({
    url: '/api/plugin/versions',
    method: 'get',
    params: query
  });
}
