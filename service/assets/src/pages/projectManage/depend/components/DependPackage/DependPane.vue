<template>
  <div class="depend-hd">
    <div class="depend-tips">
      <p class="depend-path">
        依赖路径：
        <span>{{path}}</span>
      </p>
      <el-button class="depend-btn" icon="el-icon-plus" @click="handleOnlineShow">添加依赖</el-button>
      <el-input
        class="depend-search"
        placeholder="请输入"
        suffix-icon="el-icon-search"
        v-model="localSearchName"
      ></el-input>
    </div>
    <el-table
      :data="searchDependList"
      v-loading="localListLoading"
      element-loading-text="给我一点时间"
      border-bottom
      fit
      style="width: 100%"
      class="depend-list"
    >
      <el-table-column min-width="100px" align="center" label="依赖包">
        <template slot-scope="scope">
          <img class="depends-logo" :src="scope.row.logo" />
          <div class="depend-info">
            <p class="depend-info-name">{{scope.row.name}}</p>
            <p class="depend-info-des">{{scope.row.des}}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column min-width="50px" align="center" label="当前版本" prop="version"></el-table-column>
      <el-table-column min-width="50px" align="center" label="最新版本" prop="latestVersion"></el-table-column>
      <el-table-column align="center" label="操作" width="400" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            class="text-icon-btn"
            :class="{ 'disable-text-icon-btn': !scope.row.latestVersion || scope.row.version === scope.row.latestVersion }"
            icon="el-icon-refresh"
            :disabled="!scope.row.latestVersion || scope.row.version === scope.row.latestVersion"
            @click="handleUpdate(scope.row)"
          >更新</el-button>
          <a :href="scope.row.link" class="icon-btn link-type" target="blank">···</a>
          <el-button
            size="mini"
            class="icon-btn"
            icon="el-icon-close"
            @click="handleDelete(scope.row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :title="dependType === 'devDependencies' ? '添加开发依赖' : '添加运行依赖'"
      top="10vh"
      custom-class="depend-dialog"
      :visible.sync="showOnline"
      @close="handleOnlineClose"
      width="60%"
    >
      <div class="filter-container">
        <p class="depend-path-pop">
          位置：
          <span>{{path}}</span>
        </p>
        <el-input
          class="depend-search"
          placeholder="请输入npm包名"
          suffix-icon="el-icon-search"
          v-model="onlineSearchName"
          @input="searchOnlineDepend"
        ></el-input>
      </div>
      <el-table
        ref="multipleTable"
        :data="onlineDependList"
        fit
        highlight-current-row
        style="width: 100%"
        class="depend-onlist"
        v-loading="onlineListLoading"
        element-loading-text="给我一点时间"
        :row-style="{ height: '60px' }"
      >
        <el-table-column min-width="180px" align="left" label="依赖包">
          <template slot-scope="scope">
            <img class="depends-logo" :src="scope.row.logo" />
            <div class="depend-info">
              <p class="depend-info-name">{{scope.row.name}}</p>
              <p class="depend-info-des">{{scope.row.description}}</p>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="150px" label="npm地址" show-overflow-tooltip align="left">
          <template slot-scope="scope">
            <a :href="scope.row.url" class="link-type" target="blank">{{scope.row.url}}</a>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.status" class="installed">
              <i></i>已安装
            </span>
            <span v-if="!scope.row.status" class="unstalled">
              <el-button
                type="text"
                icon="el-icon-download"
                :loading="scope.row.loading"
                @click="handleInstallNpm(scope.row)"
              >安装</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageObj.page"
          :page-sizes="[5,8,10]"
          :page-size="pageObj.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageObj.total"
        ></el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getNpmInfo, getNpmList, npmUpdate, npmDelete, getOnePkg } from './api';

export default {
  name: 'DependPane',
  props: {
    path: {
      type: String,
      default: ''
    },
    dependType: {
      type: String,
      default: 'devDependencies'
    }
  },
  data() {
    return {
      cwdPath: this.path.slice(0, -13),
      localListLoading: true,
      localSearchName: '',
      localDependList: [],
      showOnline: false,
      onlineListLoading: true,
      onlineSearchName: '',
      onlineDependList: [],
      pageObj: {
        page: 1,
        pageSize: 5,
        total: 0
      }
    };
  },
  computed: {
    searchDependList() {
      return this.localDependList.filter(v => v.name.indexOf(this.localSearchName) > -1);
    },
    realOnlineSearchName() {
      return this.onlineSearchName || 'lo';
    }
  },
  async mounted() {
    try {
      this.localListLoading = true;
      await this.getNpmsInfo();
      this.localListLoading = false;
    } catch (e) {
      this.$message.error(e.message || e);
      this.localListLoading = false;
    }
  },
  methods: {
    async getNpmsInfo() {
      const info = await getOnePkg({ path: this.path });
      this.localDependList = info[this.dependType].map(dep => ({
        ...dep,
        logo: `https://avatars.dicebear.com/v2/identicon/${dep.name}.svg`,
        link: `http://www.npmjs.com/package/${dep.name}`
      }));
      for (let i = 0; i < this.localDependList.length; i++) {
        getNpmInfo({ name: this.localDependList[i].name })
          .then(({ npmInfos = {} }) => {
            this.$set(this.localDependList, i, {
              ...this.localDependList[i],
              des: npmInfos.description,
              latestVersion: npmInfos.latestVersion
            });
          })
          .catch(e => console.log(e));
      }
    },
    async handleUpdate(row) {
      try {
        this.localListLoading = true;
        await npmUpdate({
          name: `${row.name}@${row.latestVersion}`,
          option: {
            dev: this.dependType === 'devDependencies',
            cwdPath: this.cwdPath
          }
        });

        await this.getNpmsInfo();

        this.$message.success(`更新 ${row.name} 成功！`);
        this.localListLoading = false;
      } catch (e) {
        this.$message.error(e.message || e);
        this.localListLoading = false;
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确认卸载 ${row.name} 这个依赖吗?`, '确认卸载', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        this.localListLoading = true;
        await npmDelete({
          name: row.name,
          option: {
            dev: this.dependType === 'devDependencies',
            cwdPath: this.cwdPath
          }
        });

        await this.getNpmsInfo();

        this.$message.success(`卸载 ${row.name} 成功！`);
        this.localListLoading = false;
      } catch (e) {
        this.localListLoading = false;
        if (e !== 'cancel') {
          this.$message.error(e.message || e);
        }
      }
    },
    async handleInstallNpm(row) {
      try {
        this.onlineDependList = this.onlineDependList.map(v => ({
          ...v,
          loading: v.name === row.name,
          status: false
        }));

        // 安装依赖
        await npmUpdate({
          name: row.name,
          option: {
            dev: this.dependType === 'devDependencies',
            cwdPath: this.cwdPath
          }
        });

        await this.getNpmsInfo();

        this.onlineDependList = this.onlineDependList.map(v => ({
          ...v,
          loading: v.name !== row.name,
          status: v.name === row.name
        }));

        this.$message.success(`安装 ${row.name} 成功！`);
      } catch (e) {
        this.onlineDependList = this.onlineDependList.map(v => ({
          ...v,
          loading: v.name !== row.name,
          status: false
        }));
        this.$message.error(e.message || e);
      }
    },
    async searchOnlineDepend() {
      try {
        this.onlineListLoading = true;
        const { list = [], total } = await getNpmList({
          keyword: this.realOnlineSearchName,
          pageSize: this.pageObj.pageSize,
          page: this.pageObj.page
        });

        this.onlineDependList = list.map(item => ({
          ...item,
          loading: false,
          status: this.localDependList.some(v => {
            return v.name.toLocaleLowerCase() === item.name.toLocaleLowerCase();
          })
        }));

        this.pageObj.total = total;
        this.onlineListLoading = false;
      } catch (e) {
        this.onlineListLoading = false;
        this.$message.error(e.message || e);
      }
    },
    handleOnlineShow() {
      this.showOnline = true;
      this.searchOnlineDepend();
    },
    handleSizeChange(val) {
      this.pageObj.pageSize = val;
      this.searchOnlineDepend();
    },
    handleCurrentChange(val) {
      this.pageObj.page = val;
      this.searchOnlineDepend();
    },
    handleOnlineClose() {
      this.onlineSearchName = '';
      this.onlineDependList = [];
      this.onlineListLoading = false;
    }
  }
};
</script>

<style rel="stylesheet/less" lang="less" scoped>
.depend-tips {
  overflow: hidden;
  .depend-path {
    float: left;
    color: #333;
    font-size: 14px;
    height: 34px;
    line-height: 34px;
    span {
      color: #666;
    }
  }
  .depend-search {
    width: 200px;
    float: right;
    height: 34px;
    line-height: 34px;
    margin-right: 20px;
  }

  .depend-btn {
    width: 140px;
    float: right;
    height: 34px;
    line-height: 34px;
    padding: 0;
  }
}

.depend-list {
  .depends-logo {
    width: 54px;
    height: 54px;
    float: left;
    display: block;
  }
}

/deep/ .el-input__inner {
  height: 34px;
  line-height: 34px;
}

/deep/ .el-input__icon {
  line-height: 34px;
}

/deep/ .el-dialog__body {
  padding: 20px;
}

.depend-hd {
  /deep/ .el-loading-mask {
    z-index: 1000;
  }
}

.depend-info {
  margin-left: 74px;
  text-align: left;
  height: 60px;
  line-height: 20px;
  .depend-info-name {
    height: 20px;
    color: #333;
  }
  .depend-info-des {
    height: 40px;
    overflow: hidden;
    color: #999;
    word-break: break-all;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    display: -webkit-box;
  }
}
.filter-container {
  .depend-path-pop {
    color: #333;
    font-size: 14px;
    height: 34px;
    line-height: 34px;
    display: inline-block;
    margin-right: 20px;
    span {
      color: #666;
    }
  }
  .depend-search {
    float: right;
    width: 200px;
    height: 34px;
    line-height: 34px;
  }
  .items {
    margin: 0;
    height: 34px;
    line-height: 34px;
    padding: 0 10px;
    margin-left: 10px;
  }
}

.depend-onlist {
  .depends-logo {
    width: 54px;
    height: 54px;
    float: left;
    display: block;
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
}

/deep/ .depend-dialog {
  margin-bottom: 5vh;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-container /deep/ .el-input__inner {
  height: 28px;
}
</style>