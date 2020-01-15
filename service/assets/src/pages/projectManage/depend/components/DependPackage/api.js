import axios from '@/utils/api';

// 更新npm
export function npmUpdate(query = {}) {
  return axios({
    url: '/api/depends/update',
    method: 'post',
    data: query
  });
}

// 获取npm包信息
export function getNpmInfo(query = {}) {
  return axios({
    url: '/api/depends/info',
    method: 'get',
    params: query
  });
}

// 按关键字搜索npm
export function getNpmList(query = {}) {
  return axios({
    url: '/api/depends/list',
    method: 'get',
    params: query
  });
}

// 卸载npm
export function npmDelete(query = {}) {
  return axios({
    url: '/api/depends/delete',
    method: 'post',
    data: query
  });
}

// 按关键字搜索npm
export function getOnePkg(query = {}) {
  return axios({
    url: '/api/project/onePkg',
    method: 'get',
    params: query
  });
}
