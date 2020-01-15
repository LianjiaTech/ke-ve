<template>
  <div class="sub-tabs-wrapper">
    <el-tabs>
      <el-tab-pane
        v-for="(readme, index) in readmeList"
        :key="index"
        :label="readme.shortPath"
        :lazy="true"
      >
        <readme :readme="readme" :index="index"></readme>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import Readme from './Readme';
import { getProjectReadme } from './api';

export default {
  name: 'ProjectDoc',
  components: {
    Readme
  },
  data() {
    return {
      readmeList: []
    };
  },
  async mounted() {
    try {
      const { id } = this.$route.params;
      const { readmes = [] } = await getProjectReadme({ id });
      this.readmeList = readmes;
    } catch (e) {
      console.log(e);
    }
  }
};
</script>
