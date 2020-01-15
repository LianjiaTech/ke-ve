import axios from '@/utils/api';

export function getCurrentPath(query = {}) {
  return axios({
    url: '/api/folder/currentPath',
    method: 'get',
    params: query
  });
}

export function openFolder(query = {}) {
  return axios({
    url: '/api/folder/open',
    method: 'get',
    params: query
  });
}

export function getParentPath(query = {}) {
  return axios({
    url: '/api/folder/parent',
    method: 'get',
    params: query
  });
}

export function createFolder(query = {}) {
  return axios({
    url: '/api/folder/create',
    method: 'post',
    data: query
  });
}
