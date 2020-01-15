import axios from '@/utils/api';

/**
 * 获取自定义配置信息
 * @param {Object} params
 */
const getConfig = (params = {}) => {
  return axios({
    url: '/api/config/getConfig',
    method: 'get',
    params
  });
};

/**
 * 保存自定义配置信息
 * @param {Object} data
 */
const saveConfig = (data = {}) => {
  return axios({
    url: '/api/config/saveConfig',
    method: 'post',
    data
  });
};

export default {
  getConfig,
  saveConfig
};
