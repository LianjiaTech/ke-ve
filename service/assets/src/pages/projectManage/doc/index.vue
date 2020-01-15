<template>
  <el-tabs type="card" class="tabs-wrapper">
    <el-tab-pane label="项目文档" :lazy="true">
      <project-doc />
    </el-tab-pane>
    <el-tab-pane label="需求文档" :lazy="true">
      <pm-doc />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import PmDoc from './components/PmDoc';
import ProjectDoc from './components/ProjectDoc';

export default {
  components: {
    PmDoc,
    ProjectDoc
  }
};
</script>
