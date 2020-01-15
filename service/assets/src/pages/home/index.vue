<template>
  <el-container>
    <network-alert />
    <el-header class="el-header" height="94px">
      <el-menu
        :default-active="activeIndex"
        @select="handleSelect"
        class="el-menu-nav"
        mode="horizontal"
        :router="true"
        active-text-color="#409EFF"
      >
        <el-menu-item class="el-menu-item" index="/select">项目列表</el-menu-item>
        <el-menu-item class="el-menu-item" index="/create">创建项目</el-menu-item>
        <el-menu-item class="el-menu-item" index="/import">导入项目</el-menu-item>
        <el-menu-item class="el-menu-item" index="/plugin">脚手架插件列表</el-menu-item>

        <!-- <el-submenu>
          <template class="el-menu-item" slot="title">插件</template>
          <el-menu-item class="el-menu-item" index="/plugin">脚手架列表</el-menu-item>
          <el-menu-item class="el-menu-item" index="/template">模板列表</el-menu-item>
        </el-submenu>-->
      </el-menu>
    </el-header>
    <el-main>
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </el-main>
  </el-container>
</template>

<script>
import NetworkAlert from '../../components/NetworkAlert';

export default {
  components: {
    NetworkAlert
  },
  data() {
    return {
      activeIndex: this.$route.path,
      disconneted: false
    };
  },
  watch: {
    $route(to, from) {
      this.activeIndex = to.path;
    }
  },
  methods: {
    handleSelect(key) {
      window.localStorage.setItem('lastActivePath', key);
    }
  }
};
</script>

<style lang="less" scoped>
.el-header {
  background: #fff;
  text-align: center;

  .el-menu-nav {
    display: inline-block;

    .el-menu-item {
      line-height: 94px;
      height: 94px;
      font-size: 20px;
    }
  }
}

/deep/ .el-menu--horizontal > .el-submenu .el-submenu__title {
  line-height: 94px;
  height: 94px;
  font-size: 20px;
}

/deep/ .el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  color: #5062fe !important;
  border-bottom-color: #5062fe !important;
}

/deep/ .el-menu--horizontal .el-menu--popup .el-menu-item.is-active {
  color: #5062fe !important;
  border-bottom-color: #5062fe !important;
}

/deep/ .el-menu--horizontal > .el-submenu.is-active {
  color: #5062fe !important;
  border-bottom-color: #5062fe !important;
}

/deep/ .el-menu--horizontal > .el-menu-item.is-active {
  color: #5062fe !important;
  border-bottom-color: #5062fe !important;
  border-bottom: 2px solid #5062fe !important;
}
</style>