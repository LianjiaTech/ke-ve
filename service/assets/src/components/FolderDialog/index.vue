<template>
  <el-dialog :visible="folderDialogVisible" :show-close="false">
    <el-input v-model="path" readonly>
      <el-tooltip slot="prepend" effect="dark" content="返回上级目录" placement="top">
        <el-button icon="el-icon-arrow-up" @click="getParentPath"></el-button>
      </el-tooltip>
      <el-tooltip slot="append" effect="dark" content="刷新" placement="top">
        <el-button icon="el-icon-refresh-right" @click="handleRefresh"></el-button>
      </el-tooltip>
      <el-tooltip slot="append" effect="dark" content="新建文件夹" placement="top">
        <el-button icon="el-icon-folder-add" @click="innerVisible = true"></el-button>
      </el-tooltip>
    </el-input>

    <div class="folder-wrapper" v-loading="loading" v-if="folders.length > 0">
      <el-menu class="el-menu">
        <el-menu-item v-for="(f, i) in folders" :key="i" :index="i + ''" @click="openFolder(f)">
          <i class="el-icon-folder"></i>
          <span slot="title">{{ f.name }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="handleChange">确 定</el-button>
    </span>

    <el-dialog width="30%" title="新建文件夹" :visible.sync="innerVisible" append-to-body>
      <el-input v-model="foldername" autocomplete="off"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="createFolder">创建</el-button>
      </span>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { openFolder, getParentPath, createFolder } from './api';
export default {
  name: 'FolderDialog',
  props: {
    folderDialogVisible: Boolean,
    projectPath: String
  },
  data() {
    return {
      path: this.projectPath || '',
      folders: [],
      loading: false,
      innerVisible: false,
      foldername: ''
    };
  },
  watch: {
    folderDialogVisible(val) {
      if (val) {
        this.loading = true;
        openFolder({ path: this.projectPath }).then(r => {
          this.path = r.path;
          this.folders = r.children.filter(r => !r.hidden);
          this.loading = false;
        });
      }
    }
  },
  methods: {
    openFolder(f) {
      this.loading = true;
      openFolder({ path: f.path }).then(r => {
        this.path = r.path;
        this.folders = r.children.filter(r => !r.hidden);
        this.loading = false;
      });
    },
    closeDialog() {
      this.path = '';
      this.folders = [];
      this.$emit('close');
    },
    getParentPath() {
      this.loading = true;
      getParentPath({ path: this.path }).then(r => {
        this.path = r.path;
        this.folders = r.children.filter(r => !r.hidden);
        this.loading = false;
      });
    },
    handleRefresh() {
      this.loading = true;
      openFolder({ path: this.path }).then(r => {
        this.path = r.path;
        this.folders = r.children.filter(r => !r.hidden);
        this.loading = false;
      });
    },
    handleChange() {
      this.$emit('changeProjectPath', this.path);
      this.closeDialog();
    },
    createFolder() {
      if (!this.foldername) {
        this.$message({
          type: 'error',
          message: '请输入文件夹名称'
        });
        return false;
      }
      createFolder({ path: this.path, name: this.foldername }).then(r => {
        this.innerVisible = false;
        this.foldername = null;
        return this.handleRefresh();
      });
    }
  }
};
</script>

<style lang="less" scoped>
.folder-wrapper {
  height: 240px;
  overflow-y: scroll;
  .el-menu {
    border: 0;
  }
}
</style>