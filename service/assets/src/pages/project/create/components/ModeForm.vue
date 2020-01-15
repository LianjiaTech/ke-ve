<template>
  <el-form ref="scaffold" :rules="rules" :model="mode" label-position="left">
    <!-- <el-form-item label="项目创建方式:">
      <el-radio :value="mode.type" label="1" @change="handleTypeChange('1')">脚手架插件</el-radio>
      <el-radio :value="mode.type" label="2" @change="handleTypeChange('2')">模板插件</el-radio>
    </el-form-item>-->

    <el-form-item label="选择脚手架 :" prop="plugin">
      <el-select style="width: 100%;" placeholder="请选择" :value="mode.plugin" @change="handleChange">
        <el-option
          v-for="(item,index) in modeSelectList"
          :key="index"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-alert v-show="modeSelectList.length == 0" type="error" :closable="false" show-icon>
        <el-row type="flex" align="middle" slot="title">
          <el-col :span="16">本地还没有脚手架，请先到脚手架列表页面进行安装</el-col>
          <el-col :span="8" style="text-align: right">
            <el-button size="mini" type="warning" @click="handleJump">跳转</el-button>
          </el-col>
        </el-row>
      </el-alert>
    </el-form-item>
    <config-form ref="config" v-show="mode.config"></config-form>
  </el-form>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
import ConfigForm from './ConfigForm';
export default {
  name: 'ModeForm',
  components: {
    ConfigForm
  },
  data() {
    return {
      rules: {
        plugin: [{ required: true, message: '请选择脚手架', trigger: ['blur', 'change'] }]
      }
    };
  },
  computed: {
    ...mapState('projectCreate', ['mode']),
    ...mapGetters('projectCreate', ['modeSelectList'])
  },
  methods: {
    ...mapMutations('projectCreate', ['changeMode']),
    handleTypeChange(type) {
      this.changeMode({
        type: type,
        plugin: '',
        config: null,
        list: []
      });
    },
    handleChange(value) {
      this.$store.dispatch('projectCreate/getModeConfig', value);
      if (this.$refs['config'].$refs['configform']) {
        this.$refs['config'].$refs['configform'].clearValidate();
      }
    },
    handleJump() {
      this.$router.push({ path: '/plugin' });
    },
    validateForm(callback) {
      this.$refs['scaffold'].validate(valid => {
        if (!valid) {
          return callback(false);
        }
        if (!this.mode.config) {
          return callback(true);
        }
        this.$refs['config'].$refs['configForm'].validate(valid => {
          if (valid) {
            return callback(true);
          }
          return callback(false);
        });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>