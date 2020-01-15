import axios from '@/utils/api';

/**
 * 获取自定义开发配置信息
 * @param {Object} params
 */
const getCodeConfig = (params = {}) => {
  return axios({
    url: '/api/code/getCodeConfig',
    method: 'get',
    params
  });
};

/**
 * 生成代码
 * @param {Object} data
 */
const generateCode = (data = {}) => {
  return axios({
    url: '/api/code/generateCode',
    method: 'post',
    data
  });
};

export default {
  getCodeConfig,
  generateCode
};
