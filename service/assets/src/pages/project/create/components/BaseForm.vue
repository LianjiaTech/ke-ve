<template>
  <el-form :model="project" label-position="left" ref="baseForm" :rules="rules">
    <el-form-item label="项目名称 :" prop="name">
      <el-input v-model="project.name" @input="changeProjectName" />
    </el-form-item>
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
      <el-input v-model="project.desc" />
    </el-form-item>
  </el-form>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import FolderDialog from '@/components/FolderDialog';

export default {
  name: 'BaseForm',
  components: {
    FolderDialog
  },
  data() {
    const validateName = (rule, name, callback) => {
      if (name && /[^a-zA-Z0-9_-]/g.test(name)) {
        callback(new Error('项目名称不合法'));
      } else {
        callback();
      }
    };

    return {
      folderDialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入项目名称', trigger: ['blur', 'change'] },
          { validator: validateName, trigger: ['blur', 'change'] }
        ]
      }
    };
  },
  computed: {
    ...mapState('projectCreate', ['project'])
  },
  mounted() {
    this.init();
  },
  methods: {
    ...mapMutations('projectCreate', ['changeProject']),
    ...mapActions('projectCreate', ['init']),
    changeProjectPath(path) {
      this.changeProject({
        path: this.project.name ? path + '/' + this.project.name : path,
        rootPath: path
      });
    },
    changeProjectName(name) {
      this.changeProject({
        path: this.project.rootPath + '/' + name,
        name: name
      });
    },
    validateForm(callback) {
      this.$refs['baseForm'].validate(valid => {
        callback(valid);
      });
    }
  }
};
</script>

<style lang="less" scoped>
</style>