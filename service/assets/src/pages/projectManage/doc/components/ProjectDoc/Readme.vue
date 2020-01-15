<template>
  <div>
    <div class="editor-container">
      <div class="html-hd" v-if="isHtml" v-html="html"></div>
      <markdown-editor
        v-else
        :id="'contentEditor' + index"
        :ref="'contentEditor' + index"
        v-model="content"
      ></markdown-editor>

      <i v-if="isHtml" class="md-icon el-icon-edit-outline" @click="handleEdit"></i>
      <i v-else class="md-icon el-icon-finished" @click="handleSave"></i>
    </div>
  </div>
</template>

<script>
import marked from 'marked';
import MarkdownEditor from '@/components/MarkdownEditor';
import { updateProjectDoc } from './api';

export default {
  name: 'Readme',
  components: {
    MarkdownEditor
  },
  props: {
    readme: {
      type: Object,
      default: {}
    },
    index: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      content: '',
      contentOld: '',
      html: '',
      isHtml: true
    };
  },
  mounted() {
    this.content = this.readme.content;
    this.contentOld = this.readme.content;
    this.html = marked(this.content);
  },
  methods: {
    handleEdit() {
      this.isHtml = false;
    },
    async handleSave() {
      try {
        if (this.contentOld !== this.content) {
          await updateProjectDoc({
            path: this.readme.absPath,
            content: this.content
          });
          this.$message.success('保存成功');
          this.contentOld = this.content;
          this.html = marked(this.content);
        }
        this.isHtml = true;
      } catch (e) {
        this.$message.error(e.message || e);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.editor-container {
  height: 80vh;
  position: relative;
  .md-icon {
    position: absolute;
    top: 10px;
    right: 20px;
    font-size: 30px;
    color: #316cff;
    cursor: pointer;
  }
  /deep/ .simplemde-container .CodeMirror-wrap.CodeMirror {
    height: 80vh;
    overflow: auto;
  }
  .html-hd {
    height: 80vh;
    overflow: auto;
    /deep/ h1,
    /deep/ h2 {
      margin-top: 10px;
    }
    /deep/ h3,
    /deep/ h4 {
      margin-top: 5px;
    }
    /deep/ img {
      width: 80%;
      display: block;
      margin-top: 5px;
    }
  }
}
</style>