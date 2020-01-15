
<template>
  <el-card
    class="terminal-view"
    :style="{'background-color': this.theme.background, 'color': this.theme.foreground}"
  >
    <div slot="header" class="header" v-if="toolbar">
      终端输出
      <div style="float: right; width: 160px;">
        <el-row type="flex">
          <el-col :span="6" class="bar-item">
            <el-tooltip class="item" effect="dark" content="清空" placement="top">
              <i class="el-icon-delete" @click="clear(); $emit('clear')"></i>
            </el-tooltip>
          </el-col>
          <el-col :span="6" class="bar-item">
            <el-tooltip class="item" effect="dark" content="复制" placement="top">
              <i class="el-icon-copy-document" @click="copyContent"></i>
            </el-tooltip>
          </el-col>
          <el-col :span="6" class="bar-item">
            <el-tooltip class="item" effect="dark" content="滚到底部" placement="top">
              <i class="el-icon-bottom" @click="scrollToBottom"></i>
            </el-tooltip>
          </el-col>
          <el-col :span="6" class="bar-item">
            <el-tooltip class="item" effect="dark" content="主题切换" placement="top">
              <i class="el-icon-open" @click="changeTheme"></i>
            </el-tooltip>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="view">
      <div ref="render" class="terminal-pane"></div>
    </div>
  </el-card>
</template>
<script>
import { debounce } from 'debounce';
import Terminal from './Xterm';

const defaultTheme = {
  foreground: '#2c3e50',
  background: '#fff',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff'
};

const darkTheme = {
  ...defaultTheme,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030'
};

let terminal = null;

export default {
  name: 'TerminalPane',

  props: {
    cols: {
      type: Number,
      default: 90
    },

    rows: {
      type: Number,
      default: 24
    },

    content: {
      type: String,
      default: undefined
    },

    autoSize: {
      type: Boolean,
      default: false
    },

    options: {
      type: Object,
      default: () => ({})
    },

    toolbar: {
      type: Boolean,
      default: false
    },

    title: {
      type: String,
      default: null
    },

    openLinks: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      darkMode: false
    };
  },

  computed: {
    theme() {
      if (this.darkMode) {
        return darkTheme;
      } else {
        return defaultTheme;
      }
    }
  },

  watch: {
    cols(c) {
      this.terminal.resize(c, this.rows);
    },

    rows(r) {
      this.terminal.resize(this.cols, r);
    },

    content: 'setContent',

    darkMode(value, oldValue) {
      if (typeof oldValue === 'undefined') {
        this.createTerminal();
      } else if (terminal) {
        terminal.setOption('theme', this.theme);
      }
    }
  },
  methods: {
    createTerminal() {
      terminal = new Terminal({
        cols: this.cols,
        rows: this.rows,
        theme: this.theme,
        ...this.options
      });

      terminal.open(this.$refs.render);
      if (this.autoSize) {
        this.$nextTick(this.fit);
      }
    },

    fit() {
      terminal.element.style.display = 'none';

      this.$nextTick().then(() => {
        terminal.fit();
        terminal.element.style.display = '';
        terminal.refresh(0, terminal.rows - 1);
      });
    },

    setContent(value, ln = true) {
      if (value.indexOf('\n') !== -1) {
        value.split('\n').forEach(t => this.setContent(t));
        return;
      }
      if (typeof value === 'string') {
        terminal[ln ? 'writeln' : 'write'](value);
      } else {
        terminal.writeln('');
      }
    },

    addLog(log) {
      this.setContent(log, true);
      this.scrollToBottom();
    },

    clear() {
      terminal.clear();
    },

    scrollToBottom() {
      terminal.scrollToBottom();
    },

    copyContent() {
      const textarea = terminal.textarea;
      if (!textarea) {
        return;
      }
      const textValue = textarea.value;
      const emptySelection = !terminal.hasSelection();
      try {
        if (emptySelection) {
          terminal.selectAll();
        }
        var selection = terminal.getSelection();
        textarea.value = selection;
        textarea.select();
        document.execCommand('copy');
        this.$message({
          message: '复制成功',
          type: 'success'
        });
      } finally {
        textarea.value = textValue;
        if (emptySelection) {
          terminal.clearSelection();
        }
      }
    },

    changeTheme() {
      this.darkMode = !this.darkMode;
    }
  },

  mounted() {
    if (!terminal || terminal.element != this.$el) {
      this.createTerminal();
    }

    window.addEventListener(
      'resize',
      debounce(() => {
        terminal.fit();
      }, 500)
    );
  },

  beforeDestroy() {
    terminal.destroy();
  }
};
</script>

<style lang="less" scoped>
.terminal-view {
  height: 500px;
  margin: 10px 30px;
  border: 0;

  /deep/ .el-card__header {
    border: 0;
    padding-left: 0;
  }

  /deep/ .el-card__body {
    padding-left: 0;
    padding-right: 0;
  }

  .header {
    border-left: 4px solid #5062fe;
    padding-left: 20px;
  }

  .bar-item {
    text-align: right;

    i {
      cursor: pointer;
    }
  }

  .view {
    padding-left: 16px;

    .terminal-pane {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
