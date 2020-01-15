<template>
  <div class="layout-container">
    <layout :menus="menus" :title="projectInfo.name || ''">
      <div slot="proman-right-menu" class="menus">
        <div class="menu" @click="handleOpenTerminal">
          <i class="el-icon-set-up"></i>
          <span>终端</span>
        </div>
        <div class="menu" @click="handleOpenEditor">
          <i class="el-icon-edit-outline"></i>
          <span>编辑器</span>
        </div>
        <div class="menu" @click="handleOpenFinder">
          <i class="el-icon-folder-opened"></i>
          <span>文件夹</span>
        </div>
      </div>
      <div slot="proman-side-bottom" class="footer">
        <el-popover width="130" trigger="hover" :placement="isCollapse?'left-end':'bottom-end'">
          <ul class="popover-list">
            <li class="popover-list-item">
              <router-link to="/select">
                <span class="icon el-icon-menu"></span>
                <span>项目列表</span>
              </router-link>
            </li>
            <li class="popover-list-item" @click="handleDialogVisible">
              <span class="icon el-icon-s-tools"></span>
              <span>设置</span>
            </li>
          </ul>
          <el-button slot="reference" type="primary" icon="el-icon-suitcase" circle></el-button>
        </el-popover>
        <el-dialog
          width="40%"
          title="通用配置"
          :destroy-on-close="true"
          :visible.sync="dialogVisible"
          :modal-append-to-body="false"
          :close-on-click-modal="false"
        >
          <configForm ref="configForm" :form="configForm"></configForm>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible=false">取 消</el-button>
            <el-button type="primary" @click="handleResetConfig">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </layout>
  </div>
</template>


<script>
import { mapState } from 'vuex';
import Layout from '@/components/layout/index';
import configForm from './components/ConfigForm';
import { getProjectDetail } from '../api';
import {
  openFinder,
  openEditor,
  openTerminal,
  getGlobalConfig,
  updateGlobalConfig,
  getPluginDetail
} from './api';

export default {
  components: { Layout, configForm },
  computed: {
    ...mapState('layout', {
      isCollapse: state => state.isCollapse
    })
  },
  data() {
    return {
      projectInfo: {},
      dialogVisible: false,
      configForm: {
        editor: '', // 编辑器
        terminal: '', // 终端
        customEditorCommand: '' // 自定义打开编辑器命令
      },
      menus: [
        {
          name: 'config',
          text: '配置管理',
          icon: 'el-icon-setting',
          params: { id: this.$route.params.id }
        },
        {
          name: 'code',
          text: '开发管理',
          icon: 'el-icon-edit-outline',
          params: { id: this.$route.params.id }
        },
        {
          name: 'task',
          text: '任务管理',
          icon: 'el-icon-document-checked',
          params: { id: this.$route.params.id }
        },
        {
          name: 'doc',
          text: '文档管理',
          icon: 'el-icon-document',
          params: { id: this.$route.params.id }
        },
        {
          name: 'depend',
          text: '依赖管理',
          icon: 'el-icon-link',
          params: { id: this.$route.params.id }
        },
        {
          name: 'deploy',
          text: '部署管理',
          icon: 'el-icon-s-flag',
          params: { id: this.$route.params.id }
        }
      ]
    };
  },
  async mounted() {
    try {
      const { id } = this.$route.params;
      this.projectInfo = await getProjectDetail({ id });

      const { data } = await getGlobalConfig();
      this.configForm = {
        terminal: data.terminal || '1',
        editor: data.editor || '1',
        customEditorCommand: data.customEditorCommand || ''
      };
    } catch (err) {
      console.log(err);
    }
  },
  methods: {
    handleOpenTerminal() {
      const { terminal } = this.configForm;
      const { path: projectPath } = this.projectInfo;
      if (terminal === 'webTerminal') {
        this.$terminal({
          cwd: this.projectInfo.path
        });
      } else {
        openTerminal({ terminal, projectPath }).catch(error => {
          this.$message({
            type: 'error',
            message: error.message
          });
        });
      }
    },
    handleOpenEditor() {
      const { editor } = this.configForm;
      const { path: projectPath } = this.projectInfo;
      openEditor({ editor, projectPath }).catch(error => {
        this.$message({
          type: 'error',
          message: error.message
        });
      });
    },
    handleOpenFinder() {
      openFinder({ projectPath: this.projectInfo.path }).catch(error => {
        this.$message({
          type: 'error',
          message: error.message
        });
      });
    },
    handleDialogVisible() {
      this.dialogVisible = true;
    },
    handleResetConfig() {
      updateGlobalConfig(this.configForm).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: res.msg
          });
          this.dialogVisible = false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.layout-container {
  .menus {
    display: flex;
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    font-family: PingFangSC-Regular;
    color: rgba(140, 145, 184, 1);
    .menu {
      margin-right: 15px;

      &:focus,
      &:hover {
        outline: 0;
        color: #5062fe;
      }
    }
  }
  .footer {
    position: absolute;
    bottom: 50px;
    right: 15px;

    &.collapse {
      right: 50%;
      margin-right: -20px;
    }
    /deep/ .el-dialog__header {
      border-bottom: 1px solid rgba(234, 234, 234, 1);
    }
    /deep/ .el-dialog__body {
      padding: 10px 20px 5px;
    }
    /deep/ .el-dialog__footer {
      padding-top: 20px;
      border-top: 1px solid rgba(234, 234, 234, 1);
    }
  }
}

.popover-list {
  list-style: none;
  .popover-list-item {
    font-size: 14px;
    font-family: PingFang SC;
    font-weight: 400;
    color: #333333;
    height: 40px;
    padding: 0 10px;
    line-height: 40px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    * {
      vertical-align: middle;
    }
    &:last-child {
      border-bottom: 1px solid transparent;
    }

    &:focus,
    &:hover {
      outline: 0;
      background-color: #ecf5ff;
    }

    & > a {
      display: block;
      line-height: 40px;
      height: 40px;
    }

    .icon {
      margin-right: 5px;
      width: 24px;
      text-align: center;
      font-size: 18px;
      vertical-align: middle;
    }
  }
}
</style>