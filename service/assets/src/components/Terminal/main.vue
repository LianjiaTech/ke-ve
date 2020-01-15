
<template>
  <div
    class="terminal"
    :class="{fullscreen: fullscreen}"
    id="terminal"
    :style="{backgroundColor: bgColor, color: fontColor}"
    v-show="visible"
  >
    <div class="header">
      <span>终端</span>
      <ul class="menu-list">
        <li class="el-icon-setting" @click="dialogVisible = true"></li>
        <li class="active">
          <select
            class="terminal-select"
            v-model="currentTab"
            :style="{backgroundColor: bgColor, color: fontColor }"
          >
            <option :value="index" v-for="(item, index) in terminals" :key="index">{{ '终端'+index }}</option>
          </select>
        </li>
        <!-- <li class="el-icon-plus" @click="handlePlus"></li> -->
        <li class="el-icon-refrigerator" @click="handleSplitPane"></li>
        <li class="el-icon-delete" @click="handleDelete"></li>
        <li
          :class="fullscreen ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"
          @click="handleFullscreen"
        ></li>
        <li class="el-icon-close" @click="hide"></li>
      </ul>
    </div>
    <div id="xterm-wrapper">
      <div
        v-for="(tab, index) in terminals"
        :key="index"
        class="xterm-tabs"
        v-show="index == currentTab"
      >
        <div v-if="tab.children.length >= 4" class="xterm-tab-item">
          <el-row type="flex" class="el-row-4">
            <el-col :span="12" v-for="(item, k) in tab.children.slice(0,2)" :key="k" class="el-col">
              <div class="terminal-pane" :id="item.name"></div>
            </el-col>
          </el-row>
          <el-row type="flex" class="el-row-4">
            <el-col :span="12" v-for="(item, k) in tab.children.slice(2)" :key="k" class="el-col">
              <div class="terminal-pane" :id="item.name"></div>
            </el-col>
          </el-row>
        </div>
        <div v-else class="xterm-tab-item">
          <el-row type="flex">
            <el-col
              :span="(24/tab.children.length)"
              v-for="(item, k) in tab.children"
              :key="k"
              class="el-col"
            >
              <div class="terminal-pane" :id="item.name"></div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <config-modal :visible.sync="dialogVisible" @setTheme="handleChangeTheme"></config-modal>
  </div>
</template>
<script>
import io from 'socket.io-client';
import uuidv4 from 'uuid/v4';
import axios from '@/utils/api';
import Terminal from './Xterm';
import ConfigModal from './Config';

function isInRect(rect, event) {
  if (
    event.clientY >= rect.top &&
    event.clientY <= rect.top + rect.height &&
    event.clientX >= rect.left &&
    event.clientX <= rect.left + rect.width
  ) {
    return true;
  } else {
    return false;
  }
}

export default {
  name: 'Terminal',
  data() {
    return {
      visible: true,
      fullscreen: false,
      term: null,
      terminals: [],
      socket: null,
      currentTab: 0,
      dialogVisible: false,
      theme: window.localStorage.getItem('theme')
        ? JSON.parse(window.localStorage.getItem('theme'))
        : null
    };
  },
  computed: {
    bgColor() {
      if (this.theme) {
        return this.theme.background;
      } else {
        return '#000';
      }
    },
    fontColor() {
      if (this.theme) {
        return this.theme.foreground;
      } else {
        return '#fff';
      }
    }
  },
  components: {
    ConfigModal
  },

  methods: {
    loadLocalTerminal(pane) {
      let term = new Terminal({
        theme: this.theme
      });
      term.open(document.getElementById(pane.name));
      term.write(pane.logs);

      pane.term = term;

      term.on('resize', size => {
        this.socket.emit('resize', {
          name: pane.name,
          size: [size.cols, size.rows]
        });
      });
      term.on('data', data => {
        this.socket.emit('input', {
          name: pane.name,
          data: data
        });
      });

      this.socket.on(pane.name + '-log', payload => {
        term.write(payload.log);
      });

      this.socket.on(pane.name + '-info', payload => {
        pane.pid = payload.pid;
      });

      window.addEventListener('resize', () => {
        term.fit();
      });
    },
    createTerminal(container, callback, cwd = null) {
      let terminalname = 'terminal' + uuidv4();

      let term = new Terminal({
        theme: this.theme
      });

      let pane = { term: term, name: terminalname };

      container.children.push(pane);
      container.currentPane = container.children.length - 1;

      callback && callback();

      term.on('resize', size => {
        this.socket.emit('resize', {
          name: terminalname,
          size: [size.cols, size.rows]
        });
      });
      term.on('data', data => {
        this.socket.emit('input', {
          name: terminalname,
          data: data
        });
      });

      this.socket.on(terminalname + '-log', payload => {
        term.write(payload.log);
      });

      this.socket.on(terminalname + '-info', payload => {
        pane.pid = payload.pid;
      });

      window.addEventListener('resize', () => {
        term.fit();
      });
      this.socket.emit('create', { name: terminalname, cwd });

      this.$nextTick(() => {
        term.open(document.getElementById(terminalname));
        container.children.forEach(item => {
          let termEle = document.getElementById(item.name);
          if (item.term.element != termEle.children[0]) {
            termEle.innerHTML = '';
            termEle.append(item.term.element);
          }
          item.term.fit();
          item.rect = item.term.element.getBoundingClientRect();
        });
      });
    },
    initNewTerminal() {
      if (this.terminals.length == 0) {
        let tab = { name: 'tab0', children: [] };
        this.createTerminal(
          tab,
          () => {
            this.terminals.push(tab);
            this.currentTab = this.terminals.length - 1;
          },
          this.cwd
        );
      }
    },
    handlePlus() {
      let tab = { name: 'tab' + this.terminals.length, children: [] };
      this.createTerminal(tab, () => {
        this.terminals.push(tab);
        this.currentTab = this.terminals.length - 1;
      });
    },

    handleDelete() {
      if (this.terminals.length == 1 && this.terminals[this.currentTab].children.length == 1) {
        let { name } = this.terminals[this.currentTab].children[0];
        this.socket.emit('remove', name);
        this.$el.remove();
        this.delInstance();
        this.$destroy();
      } else {
        let tab = this.terminals[this.currentTab];
        let { term, name } = tab.children[tab.currentPane];
        term.destroy();

        if (tab.children.length > 1) {
          tab.children.splice(tab.currentPane, 1);
          tab.currentPane = tab.children.length - 1;
          this.$nextTick(() => {
            tab.children.forEach(item => {
              let termEle = document.getElementById(item.name);
              if (item.term.element != termEle.children[0]) {
                termEle.innerHTML = '';
                termEle.append(item.term.element);
              }
              item.term.fit();
              item.rect = item.term.element.getBoundingClientRect();
            });
            tab.children[tab.currentPane].term.focus();
          });
        } else {
          this.terminals.splice(this.currentTab, 1);
          this.currentTab = this.terminals.length - 1;
          let tab = this.terminals[this.currentTab];
          tab.currentPane = tab.children.length - 1;
          tab.children[tab.currentPane].term.focus();

          this.$nextTick(() => {
            this.terminals.forEach(tab => {
              tab.children.forEach(item => {
                let termEle = document.getElementById(item.name);
                if (item.term.element != termEle.children[0]) {
                  termEle.innerHTML = '';
                  termEle.append(item.term.element);
                }
                item.term.fit();
                item.rect = item.term.element.getBoundingClientRect();
              });
              tab.children[tab.currentPane].term.focus();
            });
          });
        }

        this.socket.emit('remove', name);
      }
    },
    handleSplitPane() {
      // 分屏
      let tab = this.terminals[this.currentTab];
      if (tab.children.length >= 4) {
        this.$message({
          type: 'warning',
          message: '分屏已经达到最大数量'
        });
        return false;
      }

      axios({
        url: '/api/folder/cwd',
        method: 'get',
        params: {
          pid: tab.children[tab.currentPane].pid
        }
      }).then(cwd => {
        this.createTerminal(tab, null, cwd);
      });
    },

    handleChangeTheme(val) {
      this.theme = val;
      this.terminals.forEach(tab => {
        tab.children.forEach(pane => {
          pane.term.setOption('theme', val);
        });
      });

      window.localStorage.setItem('theme', JSON.stringify(val));
    },

    handleFullscreen() {
      this.fullscreen = !this.fullscreen;
      this.$nextTick(() => {
        this.terminals.forEach(tab => {
          tab.children.forEach(pane => {
            pane.term.fit();
          });
        });
      });
    },

    close() {
      if (this.terminals.length > 0) {
        this.terminals.forEach(tab => {
          if (tab.children) {
            tab.children.forEach(({ term, name }) => {
              term.destroy();
              this.socket.emit(name + '-exit');
            });
          }
        });
      }
      this.socket.close();
    },
    hide() {
      this.visible = false;
    }
  },

  mounted() {
    this.socket = io(window.location.origin + '/terminal', {
      transports: ['websocket'],
      upgrade: false
    });
    this.socket.on('terminals', payload => {
      if (payload.length > 0) {
        this.terminals = payload;
        this.currentTab = this.terminals.length - 1;
        this.$nextTick(() => {
          this.terminals.forEach((tab, i) => {
            tab.children.forEach(pane => {
              this.loadLocalTerminal(pane);
              this.$nextTick(() => {
                pane.term.fit();
                pane.rect = pane.term.element.getBoundingClientRect();
              });
            });
          });
        });
      } else {
        this.initNewTerminal();
      }
    });
    this.socket.emit('all');
  }
};
</script>

<style lang="less" scoped>
#terminal {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 400px;
  padding-top: 40px;
  background-color: #000;
  z-index: 1002;

  &.fullscreen {
    top: 0;
    height: 100%;
  }

  .header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: bolder;
    padding: 0 10px;
    box-sizing: border-box;
    border-bottom: 1px solid #909399;

    * {
      box-sizing: border-box;
    }
    .menu-list {
      list-style: none;
      float: right;
      height: 40px;
      li {
        padding: 0 10px;
        line-height: 40px;
        cursor: pointer;
        float: left;
      }
    }
    .terminal-select {
      width: 120px;
      margin-right: 5px;
    }
    .el-icon-plus,
    .el-icon-delete,
    .el-icon-arrow-down,
    .el-icon-arrow-up,
    .el-icon-refrigerator,
    .el-icon-setting {
      font-size: 18px;
    }
  }

  #xterm-wrapper {
    width: 100%;
    height: 100%;

    .xterm-tabs,
    .xterm-tab-item,
    .el-row {
      width: 100%;
      height: 100%;
    }

    .el-row-4 {
      height: 50%;
    }

    .el-row-4:last-child {
      border-top: 1px solid #dcdfe6;
    }

    .el-col {
      padding: 10px;
    }

    .terminal-pane {
      width: 100%;
      height: 100%;
    }

    .xterm {
      opacity: 0.6;
    }
    .xterm.focus {
      opacity: 1;
    }
  }
}

.el-col-12:not(:last-child),
.el-col-8:not(:last-child) {
  border-right: 1px solid #dcdfe6;
  height: 100%;
}
</style>
