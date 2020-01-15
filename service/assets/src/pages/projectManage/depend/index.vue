<template>
  <el-tabs type="card" class="tabs-wrapper">
    <el-tab-pane v-for="(pkg, index) in pkgs" :key="index" :label="pkg.shortPath" :lazy="true">
      <depend-package :pkg="pkg"></depend-package>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import DependPackage from './components/DependPackage';
import { getProjectPkgs } from '../api';

export default {
  components: {
    DependPackage
  },
  data() {
    return {
      pkgs: []
    };
  },
  async mounted() {
    const { id } = this.$route.params;
    try {
      const { pkgs = [] } = await getProjectPkgs({ id });
      this.pkgs = pkgs;
    } catch (e) {
      this.$message.error(e.message || e);
    }
  }
};
</script>