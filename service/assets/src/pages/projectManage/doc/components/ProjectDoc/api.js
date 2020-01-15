import axios from '@/utils/api';

// 获取项目目录下的所有 readme 文件
export function getProjectReadme(query = {}) {
  return axios({
    url: '/api/project/readme',
    method: 'get',
    params: query
  });
}

// 更新 readme 文件
export function updateProjectDoc(body = {}) {
  return axios({
    url: '/api/project/updateProjectDoc',
    method: 'post',
    data: body
  });
}
