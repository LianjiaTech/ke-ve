<template>
  <div class="sidebar-container">
    <div v-if="!isCollapse" class="sidebar-title">{{title}}</div>
    <el-menu
      mode="vertical"
      :default-active="activeName"
      :show-timeout="200"
      class="sidebar-menu"
      active-text-color="rgba(48,107,255,1)"
    >
      <router-link
        v-for="item in menus"
        :key="item.name"
        :to="{ name:item.name, params:item.params }"
      >
        <el-menu-item :index="item.name">
          <i :class="item.icon"></i>
          <span v-show="!isCollapse">{{item.text}}</span>
        </el-menu-item>
      </router-link>
    </el-menu>
    <slot></slot>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'SiderBar',
  props: {
    menus: { type: Array, default: [] },
    title: { type: String, default: '' }
  },
  computed: {
    ...mapState('layout', {
      isCollapse: state => state.isCollapse
    }),
    activeName() {
      return this.$route.path.split('/').pop();
    }
  }
};
</script>
<style lang="less" scoped>
.sidebar-container {
  padding-top: 75px;

  .sidebar-title {
    font-size: 16px;
    font-family: PingFang SC;
    font-weight: 400;
    text-align: center;
    width: 100%;
    color: #333333;
    position: absolute;
    margin: auto;
    left: 50%;
    top: 20px;
    transform: translate(-50%, 0);
  }
  .el-menu {
    border: 0;
  }
  .el-menu-item {
    text-align: center;
  }
}
</style>