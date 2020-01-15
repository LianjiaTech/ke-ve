<template>
  <div class="app-container">
    <el-card class="app-search-wrapper">
      <el-row type="flex" justify="space-between">
        <el-col :span="12" class="search-box">
          <el-input
            v-model="searchName"
            placeholder="插件名称"
            style="width: 300px;"
            class="filter-item"
            @keyup.enter.native="handleSearch"
          />
          <el-button class="filter-item" type="primary" @click="handleSearch">查询</el-button>
          <el-button class="filter-item" @click="handleReset">重置</el-button>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-button
            type="primary"
            class="filter-item"
            icon="el-icon-search"
            @click="handleSearchOnline"
            >搜索在线脚手架插件</el-button
          >
          <el-button class="filter-item" icon="el-icon-folder-add">
            <router-link to="/plugin/create">创建脚手架插件项目</router-link>
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-table
      :data="localList"
      v-loading="localListLoading"
      element-loading-text="给我一点时间"
      border-bottom
      fit
      style="width: 100%"
      class="plugin-list"
    >
      <el-table-column min-width="150px" align="center" label="插件名称">
        <template slot-scope="scope">
          <a :href="scope.row.link" class="link-type" target="blank">{{ scope.row.name }}</a>
        </template>
      </el-table-column>

      <el-table-column
        min-width="150px"
        align="center"
        label="插件描述"
        prop="description"
      ></el-table-column>
      <el-table-column
        min-width="100px"
        align="center"
        label="当前版本"
        prop="version"
      ></el-table-column>
      <el-table-column
        min-width="100px"
        align="center"
        label="最新版本"
        prop="latest"
      ></el-table-column>
      <el-table-column
        align="center"
        label="操作"
        width="400"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="text-icon-btn"
            icon="el-icon-refresh"
            :class="{ 'disable-text-icon-btn': scope.row.version === scope.row.latest }"
            :disabled="scope.row.version === scope.row.latest"
            @click="handleUpdate(scope.row)"
            >更新</el-button
          >
          <a :href="scope.row.link" class="icon-btn link-type" target="blank">···</a>
          <el-button
            size="mini"
            class="icon-btn"
            :class="{ 'disable-icon-btn': scope.row.status }"
            icon="el-icon-close"
            :disabled="scope.row.status"
            @click="handleDelete(scope.row, scope.$index)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="showOnline" width="60%">
      <div slot="title" class="header-title">
        <div class="online-title">
          在线脚手架插件列表
          <el-link
            class="info"
            href="https://www.npmjs.com/package/ke-ve#%E4%BB%80%E4%B9%88%E6%98%AF%E8%84%9A%E6%89%8B%E6%9E%B6%E6%8F%92%E4%BB%B6"
            target="_blank"
            type="info"
            >什么是脚手架插件？</el-link
          >
        </div>
      </div>
      <el-table
        ref="multipleTable"
        :data="onlineList"
        element-loading-text="给我一点时间"
        max-height="500px"
        height="500px"
        style="width: 100%"
        v-loading="onlineListLoading"
        :row-style="{ height: '60px' }"
      >
        <el-table-column label="插件名称" prop="name" align="center" minWidth="60px">
          <template slot-scope="scope">
            <a class="link-type" :href="scope.row.url" target="blank">{{ scope.row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="插件描述"
          minWidth="120px"
          show-overflow-tooltip
          align="center"
        ></el-table-column>
        <el-table-column prop="status" label="操作" minWidth="60px" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.status" class="installed"> <i></i>已安装 </span>
            <span v-if="!scope.row.status" class="unstalled">
              <el-button
                type="text"
                icon="el-icon-download"
                :loading="scope.row.installLoading"
                @click="handleInstallPlugin(scope.row)"
                >安装</el-button
              >
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getLocalList, getOnlineList, updatePlugin, delPlugin, downloadPlugin } from './api';

export default {
  data() {
    return {
      onlineList: [],
      localList: [],
      localListLoading: true,
      onlineListLoading: true,
      searchName: '',
      showOnline: false
    };
  },
  watch: {
    onlineList: {
      handler(val) {
        for (let onlineItem of val) {
          const index = this.localList.findIndex(
            localItem => onlineItem.name === localItem.pkgName
          );
          if (index > -1) {
            this.localList[index].latest = onlineItem.version;
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    this.getLocalList();
    this.getOnlineList();
  },
  methods: {
    async getLocalList() {
      try {
        this.localListLoading = true;
        const { list } = await getLocalList({ name: this.searchName });
        this.localListLoading = false;
        this.localList = list;
      } catch (e) {
        this.localListLoading = false;
        this.localList = [];
        this.$message.error('请求列表失败');
      }
    },
    async getOnlineList() {
      try {
        this.onlineListLoading = true;
        const { list = [] } = await getOnlineList({ keyword: 've-cli-' });
        this.onlineListLoading = false;
        this.onlineList = list.map(item => ({
          ...item,
          name: item.name,
          description: item.description.substring('ve-cli脚手架插件: '.length),
          installLoading: false
        }));
      } catch (e) {
        this.onlineList = [];
        this.onlineListLoading = false;
        this.$message.error('请求列表失败');
      }
    },
    handleSearch() {
      this.getLocalList();
    },
    async handleDelete(plugin) {
      try {
        await this.$confirm(`确认删除 ${plugin.name} 这个脚手架插件?`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        this.localListLoading = true;
        await delPlugin({ id: plugin.id });
        this.$message.success('删除成功');
        this.localListLoading = false;
        this.getLocalList();
      } catch (e) {
        this.localListLoading = false;
        if (e !== 'cancel') {
          this.$message.error(e.message || e);
        }
      }
    },
    handleReset() {
      this.searchName = '';
      this.getLocalList();
    },
    handleLink(url) {
      window.location.href = url;
    },
    async handleUpdate(plugin) {
      try {
        this.localListLoading = true;
        await updatePlugin({ id: plugin.id });
        this.$message.success('更新成功');
        this.localListLoading = false;
        this.getLocalList();
      } catch (e) {
        this.$message.error(e.message || e);
        this.localListLoading = false;
      }
    },
    handleSearchOnline() {
      this.getOnlineList();
      this.showOnline = true;
    },
    async handleInstallPlugin(item) {
      try {
        item.installLoading = true;
        await downloadPlugin({ name: item.name });
        item.installLoading = false;
        this.$message.success('安装成功');
        this.getOnlineList();
        this.getLocalList();
      } catch (e) {
        item.installLoading = false;
        this.$message.error('安装失败');
      }
    }
  }
};
</script>

<style scoped rel="stylesheet/less" lang="less">
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

.plugin-list {
  padding: 10px 50px 0;
  border-radius: 10px;
  border: 0;
  box-shadow: 0 0 10px 4px rgba(217, 220, 232, 0.8);
}
.online-title {
  padding-left: 10px;
  line-height: 24px;
  font-size: 18px;
  color: #303133;

  span {
    color: #666;
    font-size: 12px;
    margin-left: 10px;
  }
}
.installed i,
.unstalled i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  margin-right: 5px;
  background: #bfbfbf;
}
.installed i {
  background: #00a854;
}
</style>
