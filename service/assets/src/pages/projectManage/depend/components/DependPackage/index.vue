<template>
  <div class="sub-tabs-wrapper">
    <el-tabs v-model="activeName">
      <el-tab-pane label="运行依赖" name="dependencies">
        <depend-pane dependType="dependencies" :path="pkg.absPath"></depend-pane>
      </el-tab-pane>
      <el-tab-pane label="开发依赖" name="devDependencies">
        <depend-pane dependType="devDependencies" :path="pkg.absPath"></depend-pane>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DependPane from './DependPane';

export default {
  name: 'DependPackage',
  components: {
    DependPane
  },
  props: {
    pkg: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      activeName: 'dependencies'
    };
  }
};
</script>