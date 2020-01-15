<template>
  <el-form class="deploy-form" ref="deployForm" :model="deploy" label-width="150px" :rules="rules">
    <el-form-item label="Jenkins地址：" prop="jenkins">
      <el-row>
        <el-col :span="12">
          <el-input v-model="deploy.jenkins" />
        </el-col>
        <el-col :span="6">
          <el-button
            class="go-btn"
            :disabled="!isUrl(deploy.jenkins)"
            @click="handleJump(deploy.jenkins)"
          >Go!</el-button>
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">保存地址</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { getDeployConfig, saveDeployConfig } from '../api';
import { isUrl } from '@/utils';

export default {
  name: 'DeployForm',
  props: {
    projectId: {
      type: String,
      default: ''
    },
    env: {
      type: String,
      default: 'dev'
    }
  },
  data() {
    const validateUrl = (rule, value, callback) => {
      if (value && !isUrl(value)) {
        callback(new Error('url地址不合法'));
      } else {
        callback();
      }
    };

    return {
      isUrl,
      deploy: {
        jenkins: ''
      },
      rules: {
        jenkins: [{ validator: validateUrl, trigger: ['blur', 'change'] }]
      }
    };
  },
  async mounted() {
    try {
      const { deploy } = await getDeployConfig({
        env: this.env,
        projectId: this.projectId
      });
      this.deploy = deploy;
    } catch (e) {
      this.$message.error(e.message || e);
    }
  },
  methods: {
    handleSubmit() {
      this.$refs['deployForm'].validate(async valid => {
        if (valid) {
          try {
            await saveDeployConfig({
              deploy: this.deploy,
              env: this.env,
              projectId: this.projectId
            });
            this.$message.success('保存成功');
          } catch (e) {
            this.$message.error(e.message || e);
          }
        }
      });
    },
    handleJump(url) {
      window.open(url, '_blank');
    }
  }
};
</script>

<style lang="less" scoped>
.deploy-form {
  padding-right: 30px;

  .go-btn {
    margin-left: 20px;
  }
}
</style>