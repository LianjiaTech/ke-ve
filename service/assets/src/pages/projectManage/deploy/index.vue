<template>
  <el-tabs type="card" class="tabs-wrapper">
    <el-tab-pane label="测试环境" :lazy="true">
      <deploy-form env="test" :projectId="projectId" />
    </el-tab-pane>
    <el-tab-pane label="正式环境" :lazy="true">
      <deploy-form env="prod" :projectId="projectId" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { getDeployConfig } from './api';
import DeployForm from './components/DeployForm';

export default {
  components: {
    DeployForm
  },

  data() {
    return {
      projectId: this.$route.params.id
    };
  }
};
</script>

<style rel="stylesheet/less" lang="less" scoped>
.deploy-container {
  min-height: 80vh;
  margin: 40px;
  padding: 20px;
  border-radius: 6px;
  background-color: #fff;
}
</style>
