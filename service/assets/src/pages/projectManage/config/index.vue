<template>
  <el-tabs type="card" class="tabs-wrapper">
    <el-tab-pane v-for="item in config" :key="item.key" :label="item.name">
      <div v-if="item.option">
        <ncform
          :form-schema="item.option"
          :form-name="'configForm' + item.key"
          v-model="item.option.value"
        />
        <div style="text-align: center">
          <el-button @click="handleSubmit(item)" :loading="saving">保存配置</el-button>
        </div>
      </div>
    </el-tab-pane>
    <el-tab-pane label="自定义配置" v-if="config.length === 0">
      <div class="empty-wrapper">
        <img class="empty-img" :src="emptyImg" />
        <div class="empty-txt">哟嚯，没有找到任何配置项～</div>
        <el-button class="empty-btn" type="primary" @click="handleOpenUrl"
          >了解自定义配置</el-button
        >
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import API from './api';
const emptyImg = require('@/assets/imgs/empty.png');

export default {
  data() {
    return {
      emptyImg,
      projectId: this.$route.params.id,
      saving: false,
      config: []
    };
  },
  async mounted() {
    try {
      const { config = [] } = await API.getConfig({ projectId: this.projectId });
      this.config = config;
    } catch (e) {
      if (e.code !== 404) {
        this.$message.error(e.message || e);
      }
    }
  },
  methods: {
    handleSubmit(item) {
      this.$ncformValidate(`configForm${item.key}`).then(async data => {
        if (data.result) {
          try {
            await API.saveConfig({
              projectId: this.projectId,
              key: item.key,
              option: { ...item.option.value }
            });
            const { config = [] } = await API.getConfig({ projectId: this.projectId });
            this.config = config;
            this.saving = false;
            this.$message.success('保存成功');
          } catch (e) {
            this.saving = false;
            his.$message.error(e.message || e);
          }
        }
      });
    },
    handleOpenUrl() {
      window.open(
        'https://www.npmjs.com/package/ke-ve#%E6%8E%A5%E5%85%A5%E8%87%AA%E5%AE%9A%E4%B9%89%E9%A1%B9%E7%9B%AE%E9%85%8D%E7%BD%AE'
      );
    }
  }
};
</script>
