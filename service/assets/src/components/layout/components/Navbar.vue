<template>
  <div class="navbar" mode="horizontal">
    <i class="el-icon-s-fold icon" @click="toggleSideBar" v-show="!isCollapse"></i>
    <i class="el-icon-s-unfold icon" @click="toggleSideBar" v-show="isCollapse"></i>
    <div class="right-menu">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
export default {
  computed: {
    ...mapState("layout", {
      isCollapse: state => state.isCollapse
    })
  },
  methods: {
    ...mapMutations("layout", ["setCollapse"]),
    toggleSideBar() {
      this.setCollapse(!this.isCollapse);
    }
  }
};
</script>

<style rel="stylesheet/less" lang="less" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  background: #fff;
  .icon {
    margin-left: 15px;
    cursor: pointer;
    font-size: 20px;
  }
  .right-menu {
    float: right;
    height: 100%;
    margin-right: 30px;
  }
}
</style>
