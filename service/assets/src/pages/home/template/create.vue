<template>
  <el-card class="page-container">
    <el-form :model="project" ref="ruleForm" label-position="left" class="page-template-form">
      <el-form-item label="项目名称:" prop="name" :rules="[{ required: true, message: '项目名称不能为空'}]">
        <el-input v-model="project.name" @input="handleCheckName" />
        <el-alert v-if="!checkNameStatus" title="无效文件夹名称" type="error" show-icon :closable="false"></el-alert>
      </el-form-item>
      <el-form-item label="路径:" prop="path">
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

      <el-form-item label="在编辑器中打开" prop="delivery">
        <el-switch v-model="project.open"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">创建</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import FolderDialog from "@/components/FolderDialog";
import { getCurrentPath, createTplProject } from "./api";

export default {
  name: "TemplateCreate",
  data() {
    return {
      checkNameStatus: true,
      rootPath: "", //项目根目录
      folderDialogVisible: false,
      project: {
        path: "", // 项目路径
        name: "", // 项目名称
        open: true
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
  methods: {
    changeProjectPath(path) {
      this.project.path = this.project.name
        ? path + "/" + this.project.name
        : path;
      this.rootPath = path;
    },
    handleCheckName(name) {
      if (!/[^a-zA-Z0-9_-]/g.test(name) && name != "") {
        this.project.name = name;
        this.project.path = this.rootPath + "/" + name;
        this.checkNameStatus = true;
        return true;
      } else {
        this.checkNameStatus = false;
        this.project.name = name;
        return false;
      }
    },
    onSubmit() {
      this.$refs["ruleForm"].validate(valid => {
        if (valid) {
          createTplProject(this.project)
            .then(r => {
              this.$message({
                type: "success",
                message: r.msg || "创建成功"
              });
              this.reset();
            })
            .catch(e => {
              this.$message({
                type: "error",
                message: e
              });
            });
        } else {
          return false;
        }
      });
    },

    reset() {
      this.project = {
        name: "",
        path: this.rootPath,
        open: true
      };
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