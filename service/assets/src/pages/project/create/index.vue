<template>
  <el-card class="create-container">
    <el-steps :active="active" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="脚手架信息"></el-step>
    </el-steps>

    <div class="form-tabs">
      <base-form ref="base" v-show="active ==0" class="form-tab-item" key="base"></base-form>
      <mode-form ref="mode" v-show="active == 1" class="form-tab-item" key="mode"></mode-form>
    </div>
    <div class="btn-group">
      <el-button @click="handleBack" v-show="active != 0">上一步</el-button>
      <el-button @click="handleNext" v-show="active != 1">下一步</el-button>
      <el-button @click="handleCreate" v-show="active == 1">创建项目</el-button>
    </div>
  </el-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { Loading } from 'element-ui';
import BaseForm from './components/BaseForm';
import ModeForm from './components/ModeForm';

export default {
  components: {
    BaseForm,
    ModeForm
  },
  data() {
    return {
      active: 0
    };
  },
  computed: {
    ...mapState('projectCreate', ['mode']),
    ...mapGetters('projectCreate', ['modeSelectList'])
  },
  mounted() {
    this.sse = new EventSource('/api/project/sse/create');
    this.loadingInstance = null;
  },
  beforeDestroy() {
    this.sse.close();
    this.loadingInstance = null;
  },
  methods: {
    handleNext() {
      this.$refs['base'].validateForm(status => {
        if (status) {
          if (this.active++ > 1) this.active = 0;
        }
      });
    },
    handleBack() {
      if (this.active-- < 0) this.active = 0;
    },
    handleCreate() {
      this.$refs['mode'].validateForm(status => {
        if (status) {
          this.loadingInstance = Loading.service({
            fullscreen: true,
            text: '创建项目中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          this.sse.addEventListener(
            'process',
            event => {
              this.loadingInstance.close();
              this.loadingInstance = Loading.service({
                fullscreen: true,
                text: event.data,
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
              });
            },
            false
          );
          this.$store
            .dispatch('projectCreate/createProject')
            .then(r => {
              this.loadingInstance.close();
              this.$message.success('创建成功');
              this.$router.push({ path: '/select' });
            })
            .catch(e => {
              this.loadingInstance.close();
              this.$message.error(e || '创建失败');
            });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.create-container {
  max-width: 800px;
  margin: 20px auto;
  background-color: #fff;

  .btn-group {
    margin: 20px auto;
    text-align: center;
  }

  .form-tabs {
    width: 600px;
    margin: 20px auto;
  }
}

/deep/ .el-alert__content {
  width: 100%;
}
/deep/ .el-alert__title {
  display: block;
  height: 100%;
}
</style>