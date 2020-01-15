import axios from '@/utils/api';

export function getlist(query = {}) {
  return axios({
    url: '/api/template/list',
    method: 'get',
    params: query
  });
}

export function updateTpl(query = {}) {
  return axios({
    url: '/api/template/update',
    method: 'post',
    data: query
  });
}

export function addTpl(query = {}) {
  return axios({
    url: '/api/template/add',
    method: 'post',
    data: query
  });
}

export function delTpl(query = {}) {
  return axios({
    url: '/api/template/delete',
    method: 'post',
    data: query
  });
}

export function createTplProject(query = {}) {
  return axios({
    url: '/api/template/create',
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
