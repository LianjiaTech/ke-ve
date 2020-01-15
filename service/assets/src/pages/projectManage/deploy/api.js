import axios from '@/utils/api';

/**
 * 部署配置：获取项目部署配置
 * @param {Object} params
 */
export function getDeployConfig(params = {}) {
  return axios({
    url: '/api/deploy/getConfig',
    method: 'get',
    params
  });
}

/**
 * 部署配置：保存项目部署配置
 * @param {Object} data
 */
export function saveDeployConfig(data = {}) {
  return axios({
    url: '/api/deploy/saveConfig',
    method: 'post',
    data
  });
}
