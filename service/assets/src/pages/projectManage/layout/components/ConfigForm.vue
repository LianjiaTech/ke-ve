<template>
  <div class="config-container">
    <el-form :model="form" label-width="80px">
      <el-form-item label="终端：">
        <el-radio-group v-model="form.terminal">
          <el-radio label="webTerminal"></el-radio>
          <el-radio label="iTerm"></el-radio>
          <el-radio label="Terminal"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="编辑器：">
        <el-radio-group v-model="form.editor">
          <el-radio label="Visual Studio Code">Visual Studio Code</el-radio>
          <el-radio label="Sublime Text"></el-radio>
          <el-radio label="Atom"></el-radio>
          <el-radio label="WebStorm"></el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>


<script>
export default {
  props: {
    form: Object
  }
};
</script>

<style lang="less" scoped>
.config-container {
  .el-radio {
    display: block;
    margin: 12px 0;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>