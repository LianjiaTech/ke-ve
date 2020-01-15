import axios from '@/utils/api';

// 获取项目详情
export function getProjectDetail(query = {}) {
  return axios({
    url: '/api/project/detail',
    method: 'get',
    params: query
  });
}

// 获取项目目录下的package.json
export function getProjectPkgs(query = {}) {
  return axios({
    url: '/api/project/pkgs',
    method: 'get',
    params: query
  });
}
