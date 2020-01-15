import axios from '@/utils/api';

// 获取当前路径
export function getCurrentPath(query = {}) {
  return axios({
    url: '/api/folder/currentPath',
    method: 'get',
    params: query
  });
}
