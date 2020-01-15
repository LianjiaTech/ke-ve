import axios from '@/utils/api';

// 导入项目
export function importProject(query = {}) {
  return axios({
    url: '/api/project/import',
    method: 'post',
    data: query
  });
}
