<template>
  <div class="app-container">
    <el-table
      :data="list"
      v-loading="listLoading"
      element-loading-text="给我一点时间"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" prop="id"></el-table-column>
      <el-table-column min-width="100px" align="center" label="模板名称" prop="name"></el-table-column>

      <el-table-column min-width="80px" align="center" label="git地址" prop="git"></el-table-column>

      <el-table-column min-width="150px" align="center" label="模板路径" prop="path"></el-table-column>

      <el-table-column align="center" label="操作" width="300" class-name="small-padding fixed-width">
        <template slot="header">
          <el-button-group>
            <el-button @click="bindAddVisible = true">添加模板</el-button>
            <el-button>
              <router-link to="/template/create">创建模板</router-link>
            </el-button>
          </el-button-group>
        </template>
        <template slot-scope="scope">
          <el-button size="mini" type="success" @click="handleUpdate(scope.row)">更新</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row,scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="确定删除吗？" :visible.sync="bindDeleteVisible">
      <div class="dialog-footer" style="text-align:right">
        <el-button @click="bindDeleteVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete">确认</el-button>
      </div>
    </el-dialog>

    <el-dialog title="添加模板" :visible.sync="bindAddVisible">
      <el-input v-model="newTplGit" autocomplete="off" placeholder="请输入项目模板git地址"></el-input>
      <div class="dialog-footer" style="text-align:right;margin-top: 20px;">
        <el-button @click="bindAddVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getlist, updateTpl, delTpl, addTpl } from "./api";
export default {
  data() {
    return {
      list: [],
      listLoading: true,
      bindDeleteVisible: false,
      bindAddVisible: false,
      willdelete: null,
      newTplGit: null
    };
  },

  mounted() {
    getlist().then(res => {
      this.list = res.list;
      this.listLoading = false;
    });
    if (this.$route.query.add) {
      this.bindAddVisible = true;
    }
  },
  methods: {
    hanldeUpdateClose() {
      if (this.updatesse) {
        this.updatesse.close();
        this.updatesse = null;
      }
      this.updateStepVisible = false;
    },

    handleDelete(project, index) {
      this.bindDeleteVisible = true;
      this.willdelete = {
        id: project.id,
        index: index
      };
    },

    handleUpdate(tpl) {
      if (this.listLoading) return false;
      this.listLoading = true;
      updateTpl({ id: tpl.id })
        .then(res => {
          this.$message({
            type: "success",
            message: res.msg || "更新成功"
          });
          this.listLoading = false;
        })
        .catch(e => {
          this.$message({
            type: "error",
            message: e || "更新失败"
          });
          this.listLoading = false;
        });
    },
    confirmDelete() {
      delTpl({
        id: this.willdelete.id
      })
        .then(r => {
          this.bindDeleteVisible = false;
          this.$message({
            message: "删除成功",
            type: "success"
          });
          this.list.splice(this.willdelete.index, 1);
        })
        .catch(e => {
          this.bindDeleteVisible = false;
          this.$message({
            message: e || "删除失败",
            type: "error"
          });
        });
    },
    handleAdd() {
      if (!this.newTplGit || !this.newTplGit.trim()) {
        return this.$message({
          type: "error",
          message: "模板地址不能为空"
        });
      }

      this.bindAddVisible = false;

      addTpl({ repo: this.newTplGit.trim() })
        .then(res => {
          this.newTplGit = null;
          return this.$message({
            type: "success",
            message: res.msg || "添加成功"
          });
        })
        .catch(e => {
          this.newTplGit = null;
          return this.$message({
            type: "error",
            message: res.msg || "添加失败"
          });
        });
    }
  }
};
</script>

<style scoped>
</style>
