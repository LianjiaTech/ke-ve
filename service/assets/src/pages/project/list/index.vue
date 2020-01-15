<template>
  <div class="app-container">
    <el-card class="app-search-wrapper">
      <el-row type="flex" justify="space-between">
        <el-col :span="12" class="search-box">
          <el-input
            v-model="projectName"
            placeholder="请输入项目名称"
            style="width: 300px;"
            class="filter-item"
            @keyup.enter.native="handleFilter"
          />
          <el-button class="filter-item" type="primary" @click="handleFilter">查询</el-button>
          <el-button class="filter-item" @click="handleReset">重置</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button-group>
            <el-button
              type="primary"
              class="filter-item"
              icon="el-icon-plus"
              @click="handleCreate"
            >创建项目</el-button>
          </el-button-group>
        </el-col>
      </el-row>
    </el-card>
    <el-table
      :data="list"
      v-loading="listLoading"
      element-loading-text="给我一点时间"
      border-bottom
      fit
      highlight-current-row
      style="width: 100%"
      class="project-list"
    >
      <el-table-column min-width="80px" align="center" label="项目名称" prop="name"></el-table-column>
      <el-table-column min-width="150px" align="center" label="项目描述" prop="desc"></el-table-column>
      <el-table-column min-width="150px" align="center" label="项目路径" prop="path">
        <template slot-scope="scope">
          <span class="link-type" @click="handleOpenFinder(scope.row)">{{ scope.row.path }}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="50px" align="center" label="项目类型">
        <template slot-scope="scope">
          <span v-if="scope.row.type === 'create'">创建</span>
          <span v-if="scope.row.type === 'import'">导入</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="400" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="text-icon-btn"
            icon="el-icon-s-operation"
            @click="handleView(scope.row)"
          >管理</el-button>
          <el-button
            size="mini"
            class="icon-btn"
            icon="el-icon-close"
            @click="handleDelete(scope.row, scope.$index)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getProjectList, delProject, openFinder } from './api';

export default {
  data() {
    return {
      projectName: '',
      list: [],
      listLoading: true,
      shouldDelFolder: false
    };
  },
  mounted() {
    this.searchProjectList();
  },
  methods: {
    searchProjectList(projectName = '') {
      this.listLoading = true;
      getProjectList({ projectName })
        .then(res => {
          this.list = res.list;
          this.listLoading = false;
        })
        .catch(err => {
          this.$message.error(err.message);
          this.listLoading = false;
        });
    },
    handleFilter() {
      this.searchProjectList(this.projectName);
    },
    handleReset() {
      this.projectName = '';
      this.searchProjectList();
    },
    handleCreate() {
      this.$router.push({ path: '/create' });
    },
    handleView(row) {
      this.$router.push({ path: '/project/' + row.id + '/config' });
    },
    handleDelete(project, index) {
      const h = this.$createElement;
      const that = this;
      this.$msgbox({
        title: `确认删除`,
        message: h('div', null, [
          h('span', null, `确认删除 ${project.name} 这个项目吗?`),
          h('div', null, [
            h(
              'ElCheckbox',
              {
                key: new Date().getTime(),
                props: { checked: that.shouldDelFolder },
                on: {
                  change(val) {
                    that.shouldDelFolder = val;
                  }
                }
              },
              '同时删除本地项目'
            )
          ])
        ]),
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.listLoading = true;
        delProject({
          id: project.id,
          shouldDelFolder: this.shouldDelFolder
        })
          .then(r => {
            this.listLoading = false;
            this.$message({ message: '删除成功', type: 'success', duration: 1000 });
            this.list.splice(index, 1);
          })
          .catch(e => {
            this.listLoading = false;
            this.$message({ message: e || '删除失败', type: 'error', duration: 1000 });
          });
      });
    },
    handleOpenFinder(row) {
      openFinder({ projectPath: row.path }).catch(err => {
        this.$message.error(err.message);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.app-container {
  .app-search-wrapper {
    margin-bottom: 20px;
    border-radius: 10px;
    .search-box {
      font-size: 0;
      .filter-item {
        margin-right: 10px;
        margin-left: 0;
      }
    }
  }

  .project-list {
    padding: 10px 50px 0;
    border-radius: 10px;
    border: 0;
    box-shadow: 0 0 10px 4px rgba(217, 220, 232, 0.8);
    .update-plugin {
      width: 90px;
      height: 36px;
      background: rgba(238, 240, 246, 1);
      opacity: 0.8;
      border-radius: 18px;
      border: 0;
      color: #7381fe;
    }
    .icon-plugin {
      width: 36px;
      height: 36px;
      line-height: 36px;
      display: inline-block;
      background: rgba(238, 240, 246, 1);
      border-radius: 50%;
      vertical-align: top;
      border: 0;
      padding: 0;
      color: #a7a9ba;
      font-weight: bold;
    }
  }
}
</style>
