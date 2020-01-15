<template>
  <el-form ref="configForm" :model="mode.config" label-position="left">
    <template v-for="(option,index) in mode.list">
      <el-form-item
        :key="index"
        :label="option.message + ' :'"
        v-if="parseType(option)==='input'"
        :prop="option.name"
        :rules="[{ required: true, message: `请输入${option.message}`, trigger: ['blur', 'change'] },]"
      >
        <el-input
          :value="mode.config[option.name]"
          @input="(val) => {hanlechange(option.name, val)}"
        />
      </el-form-item>
      <el-form-item
        :key="index"
        :label="option.message + ' :'"
        v-if="parseType(option)==='confirm'"
        :prop="option.name"
        :rules="[{ required: true, message: `请选择${option.message}`, trigger: ['blur', 'change'] },]"
      >
        <el-switch
          :value="mode.config[option.name]"
          @change="(val) => {hanlechange(option.name, val)}"
        />
      </el-form-item>
      <el-form-item
        :key="index"
        :label="option.message + ' :'"
        v-if="parseType(option)==='checkbox'"
        :prop="option.name"
        :rules="[{ required: true, message: `请选择${option.message}`, trigger: ['blur', 'change'] },]"
      >
        <el-checkbox-group
          v-model="mode.config[option.name]"
          @change="(val) => {hanlechange(option.name, val)}"
        >
          <el-checkbox
            v-for="(item,idx) in option.choices"
            :key="idx"
            :label="item.value"
          >{{ item.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item
        :key="index"
        :label="option.message + ' :'"
        v-if="parseType(option)==='list'"
        :prop="option.name"
        :rules="[{ required: true, message: `请选择${option.message}`, trigger: ['blur', 'change'] },]"
      >
        <el-select
          style="width:100%"
          :value="mode.config[option.name]"
          placeholder="请选择"
          @change="(val) => {hanlechange(option.name, val)}"
        >
          <el-option
            :key="idx"
            :label="item.name || item.value"
            :value="item.value"
            v-for="(item,idx) in option.choices"
          ></el-option>
        </el-select>
      </el-form-item>
    </template>
  </el-form>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex';
export default {
  name: 'ConfigForm',
  data() {
    return {
      prompts: {}
    };
  },
  computed: {
    ...mapState('projectCreate', ['mode']),
    rules() {}
  },
  mounted() {
    console.log(this.mode);
  },
  methods: {
    ...mapMutations('projectCreate', ['changeModeConfig']),
    parseType(option) {
      return option.type || 'input';
    },
    hanlechange(name, val) {
      console.log(JSON.stringify(val));
      this.changeModeConfig({
        [name]: val
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>