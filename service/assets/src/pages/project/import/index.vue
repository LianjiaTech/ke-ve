<template>
  <el-card class="import-container">
    <div class="form-tabs">
      <el-form ref="form" :model="project" :rules="rules" label-position="left">
        <el-form-item label="项目路径 :" prop="path">
          <el-input v-model="project.path" readonly>
            <el-button slot="append" icon="el-icon-edit" @click="folderDialogVisible = true"></el-button>
          </el-input>
          <folder-dialog
            :folderDialogVisible="folderDialogVisible"
            :projectPath="project.rootPath"
            @close="folderDialogVisible = false"
            @changeProjectPath="changeProjectPath"
          ></folder-dialog>
        </el-form-item>
        <el-form-item label="项目描述 :" prop="desc">
          <el-input v-model="project.desc"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="btn-group">
      <el-button @click="handleImport">导入项目</el-button>
    </div>
  </el-card>
</template>

<script>
import FolderDialog from '@/components/FolderDialog';
import { Loading } from 'element-ui';
import { importProject } from './api';
import { getCurrentPath } from '../api';

export default {
  components: {
    FolderDialog
  },
  data() {
    return {
      project: {
        rootPath: '',
        path: '',
        name: '',
        desc: ''
      },
      folderDialogVisible: false,
      rules: {
        path: [{ required: true, message: '请选择项目路径', trigger: ['blur', 'change'] }]
      }
    };
  },
  async mounted() {
    try {
      const { path = '' } = await getCurrentPath();
      this.changeProjectPath(path);
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    changeProjectPath(path) {
      const pathList = path.split('/');
      const name = pathList.pop();
      this.project.path = path;
      this.project.name = name;
      this.project.rootPath = pathList.join('/');
    },
    handleImport() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const project = { ...this.project };
          const loadingInstance = Loading.service({
            fullscreen: true,
            text: '导入项目中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)'
          });
          importProject({ project })
            .then(data => {
              loadingInstance.close();
              this.$message.success('导入项目成功');
              this.$router.push({ path: '/select' });
            })
            .catch(err => {
              loadingInstance.close();
              this.$message.error(err.message);
            });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.import-container {
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
</style>