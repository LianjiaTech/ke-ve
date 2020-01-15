import axios from '@/utils/api';

// 获取项目列表
export function getProjectList(query = {}) {
  return axios({
    url: '/api/project/list',
    method: 'get',
    params: query
  });
}

// 删除项目
export function delProject(query = {}) {
  return axios({
    url: '/api/project/delete',
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
