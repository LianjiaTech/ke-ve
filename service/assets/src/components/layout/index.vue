<template>
  <div class="app-wrapper">
    <network-alert />
    <sidebar
      class="sidebar-container"
      :class="isCollapse?'hide-sidebar':'show-sidebar'"
      :menus="menus"
      :title="title"
    >
      <slot name="proman-side-bottom"></slot>
    </sidebar>
    <div class="main-container" :class="isCollapse?'mr-60':'mr-220'">
      <navbar>
        <slot name="proman-right-menu"></slot>
      </navbar>
      <app-main></app-main>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AppMain from './components/AppMain';
import NetworkAlert from '../NetworkAlert';

export default {
  name: 'layout',
  components: { Navbar, Sidebar, AppMain, NetworkAlert },
  props: {
    menus: { type: Array, default: [] },
    title: { type: String, default: '' }
  },
  computed: {
    ...mapState('layout', {
      isCollapse: state => state.isCollapse
    })
  }
};
</script>

<style rel="stylesheet/less" lang="less" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  .main-container {
    min-height: 100%;
    transition: margin-left 0.28s;
  }
  .mr-220 {
    margin-left: 220px;
  }
  .mr-60 {
    margin-left: 60px;
  }
  /*侧边栏*/
  .sidebar-container {
    transition: width 0.28s;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    overflow: hidden;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 6px 14px 0px rgba(217, 220, 232, 0.8);
  }
  .show-sidebar {
    width: 220px;
  }
  .hide-sidebar {
    width: 60px;
  }
}
.app-wrapper:after {
  content: '';
  display: table;
  clear: both;
}
</style>
