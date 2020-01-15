<template>
  <el-card class="page-container">
    <el-form :model="project" ref="ruleForm" label-position="left" class="page-template-form">
      <el-form-item label="项目名称:" prop="name" :rules="rules.name">
        <el-input v-model="project.name">
          <template slot="prepend">ve-cli-</template>
        </el-input>
      </el-form-item>
      <el-form-item label="项目路径:" prop="path">
        <el-input v-model="project.path" readonly>
          <el-button slot="append" icon="el-icon-edit" @click="folderDialogVisible = true"></el-button>
        </el-input>
        <folder-dialog
          :folderDialogVisible="folderDialogVisible"
          :projectPath="rootPath"
          @close="folderDialogVisible = false"
          @changeProjectPath="changeProjectPath"
        ></folder-dialog>
      </el-form-item>

      <el-form-item label="脚手架地址类型:" prop="type" :rules="rules.type">
        <el-radio-group v-model="project.type">
          <el-radio label="npm"></el-radio>
          <el-radio label="git"></el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="project.type === 'npm'"
        label="脚手架npm地址:"
        prop="npmUrl"
        :rules="rules.npmUrl"
      >
        <el-input v-model="project.npmUrl" placeholder="请输入脚手架npm地址" />
      </el-form-item>

      <el-form-item
        v-if="project.type === 'npm'"
        label="脚手架npm包名:"
        prop="npmName"
        :rules="rules.npmName"
      >
        <el-input v-model="project.npmName" placeholder="请输入脚手架npm包名" />
      </el-form-item>

      <el-form-item
        v-if="project.type === 'git'"
        label="脚手架git地址:"
        prop="gitUrl"
        :rules="rules.gitUrl"
      >
        <el-input v-model="project.gitUrl" placeholder="请输入脚手架git地址" />
      </el-form-item>

      <el-form-item label="脚手架描述:" prop="desc" :rules="rules.desc">
        <el-input v-model="project.desc" placeholder="请输入脚手架描述" />
      </el-form-item>

      <el-form-item label="在编辑器中打开:" prop="open">
        <el-switch v-model="project.open"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">创建</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import FolderDialog from '@/components/FolderDialog';
import { getCurrentPath, createPluginProject } from './api';

export default {
  name: 'TemplateCreate',
  data() {
    const validateName = (rule, value, callback) => {
      if (value && /[^a-zA-Z0-9_-]/g.test(value)) {
        callback(new Error('文件名不合法'));
      } else {
        callback();
      }
    };

    return {
      checkNameStatus: true,
      rootPath: '', //项目根目录
      folderDialogVisible: false,
      project: {
        path: '', // 项目路径
        name: '', // 项目名称
        fullName: '', // 项目全名：默认给name加上前缀ve-cli-
        type: 'npm', // 脚手架类型：npm、git
        npmUrl: '', // 脚手架npm地址
        npmName: '', // 脚手架npm包名
        gitUrl: '', // 脚手架git地址
        desc: '', // 脚手架描述
        open: true // 是否用编辑器打开
      },
      rules: {
        name: [
          { required: true, message: '项目名称不能为空', trigger: ['blur', 'change'] },
          { validator: validateName, trigger: ['blur', 'change'] }
        ],
        type: [{ required: true, message: '脚手架地址类型不能为空', trigger: ['blur', 'change'] }],
        npmUrl: [{ required: true, message: 'npm地址不能为空', trigger: ['blur', 'change'] }],
        npmName: [{ required: true, message: 'npm包名不能为空', trigger: ['blur', 'change'] }],
        gitUrl: [{ required: true, message: 'git地址不能为空', trigger: ['blur', 'change'] }],
        desc: [{ required: true, message: '脚手架描述不能为空', trigger: ['blur', 'change'] }]
      }
    };
  },
  components: {
    FolderDialog
  },
  mounted() {
    getCurrentPath().then(({ path }) => {
      this.rootPath = path;
      this.project.path = path;
    });
  },
  computed: {
    projectName() {
      return this.project.name;
    }
  },
  watch: {
    projectName(newVal, oldVal) {
      if (newVal) {
        this.project.fullName = `ve-cli-${this.project.name}`;
        this.project.path = this.rootPath + '/' + this.project.fullName;
      } else {
        this.project.fullName = '';
        this.project.path = this.rootPath;
      }
    }
  },
  methods: {
    changeProjectPath(path) {
      this.project.path = this.project.fullName ? path + '/' + this.project.fullName : path;
      this.rootPath = path;
    },
    onSubmit() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          createPluginProject(this.project)
            .then(r => {
              this.$message.success('创建成功');
              this.$router.go(-1);
            })
            .catch(e => {
              this.$message.error(e);
            });
        }
      });
    },
    onCancel() {
      this.$router.go(-1);
    }
  }
};
</script>

<style lang="less" scoped>
.page-container {
  max-width: 800px;
  margin: 20px auto;
  background-color: #fff;
}
.page-template-form {
  width: 600px;
  margin: 20px auto;
}
</style>