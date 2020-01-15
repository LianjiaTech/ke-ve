import axios from '@/utils/api';

// 获取项目目录下的需求文档
export function getProjectPmDoc(query = {}) {
  return axios({
    url: '/api/project/pmDoc',
    method: 'get',
    params: query
  });
}

// 新建或保存需求文档
export function createProjectPmDoc(body = {}) {
  return axios({
    url: '/api/project/createPmDoc',
    method: 'post',
    data: body
  });
}

// 更新需求文档
export function updateProjectPmDoc(body = {}) {
  return axios({
    url: '/api/project/updatePmDoc',
    method: 'post',
    data: body
  });
}

// 删除需求文档
export function deleteProjectPmDoc(body = {}) {
  return axios({
    url: '/api/project/deletePmDoc',
    method: 'post',
    data: body
  });
}
