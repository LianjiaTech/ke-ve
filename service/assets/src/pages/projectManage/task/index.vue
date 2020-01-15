<template>
  <div>
    <keep-alive>
      <el-tabs
        v-loading="loading"
        class="task-tabs-wrapper tabs-wrapper"
        type="card"
        @tab-click="handleTabClick"
        v-model="activeIndex"
      >
        <el-tab-pane v-for="(pkg, i) in pkgs" :key="i" :label="pkg.shortPath">
          <el-tabs
            class="sub-task-tabs-wrapper sub-tabs-wrapper"
            v-model="subactiveIndex"
            @tab-click="handleSubTabClick"
          >
            <el-tab-pane
              v-for="(key, j) in Object.keys(pkg.scripts)"
              :key="j"
              :label="key"
              :name="key"
            >
              编译执行：
              <span class="dark">{{pkg.scripts[key].command}}</span>
              <el-button
                class="launch-btn"
                @click="handleRun(i,key, pkg.scripts[key].status)"
              >{{ pkg.scripts[key].status == 'ing' ? '停止' : '运行' }}</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <terminal-pane
          ref="terminal"
          toolbar
          :options="{
            scrollback: 5000,
            disableStdin: true,
            useFlowControl: true
          }"
          @clear="clearLogs"
        ></terminal-pane>
      </el-tabs>
    </keep-alive>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { debounce } from 'debounce';
import { mapState, mapMutations } from 'vuex';
import TerminalPane from '@/components/Terminal/Pane.vue';

export default {
  components: { TerminalPane },
  data() {
    return {
      activeIndex: 0,
      subactiveIndex: null,
      socket: null,
      loading: true
    };
  },
  computed: {
    ...mapState('projectTask', ['pkgs'])
  },

  mounted() {
    const { id } = this.$route.params;
    this.socket = io(window.location.origin + '/task');
    this.socket.on('log', data => {
      if (data.type == 'status') {
        this.changeStatus(data.payload.status);
      } else {
        const terminal = this.$refs.terminal;
        if (terminal) {
          terminal.addLog(data.payload.log.replace(/\n/g, '\r\n'));
        }
      }
    });
    this.socket.on('info', taskInfo => {
      taskInfo = JSON.parse(taskInfo);
      if (!taskInfo.cwd) return;
      let pkg = this.pkgs.findIndex(item => item.cwd === taskInfo.cwd);
      if (pkg == this.activeIndex && taskInfo.name == this.subactiveIndex) {
        if (taskInfo.log) {
          const terminal = this.$refs.terminal;
          terminal.addLog(taskInfo.log);
        }

        let status = this.pkgs[this.activeIndex].scripts[this.subactiveIndex].status;
        if (taskInfo.status != status) {
          this.changeStatus(taskInfo.status);
        }
      }
    });
    this.$store.dispatch('projectTask/init', id).then(pkgs => {
      let subactiveIndex = Object.keys(pkgs[this.activeIndex].scripts)[0];
      this.socket.emit('init', {
        cwd: pkgs[this.activeIndex].cwd
      });
      this.socket.emit('getinfo', {
        cwd: pkgs[this.activeIndex].cwd,
        name: subactiveIndex
      });
      this.subactiveIndex = subactiveIndex;
      this.loading = false;
    });
  },
  methods: {
    ...mapMutations('projectTask', ['updateStatus']),
    handleTabClick(tab, e) {
      let subactiveIndex = Object.keys(this.pkgs[tab.index].scripts)[0];
      const terminal = this.$refs.terminal;
      terminal.clear();

      this.socket.emit('init', {
        cwd: this.pkgs[tab.index].cwd
      });
      this.socket.emit('getinfo', {
        cwd: this.pkgs[tab.index].cwd,
        name: subactiveIndex
      });
      this.activeIndex = tab.index;
      this.subactiveIndex = subactiveIndex;
    },
    handleSubTabClick(tab, e) {
      const terminal = this.$refs.terminal;
      terminal.clear();
      this.socket.emit('getinfo', {
        cwd: this.pkgs[this.activeIndex].cwd,
        name: tab.name
      });
      this.subactiveIndex = tab.name;
    },
    handleRun: debounce(function(i, key, status) {
      if (status == 'ing') {
        this.socket.emit('stop', {
          cwd: this.pkgs[i].cwd,
          name: key
        });
      } else {
        this.socket.emit('run', {
          cwd: this.pkgs[i].cwd,
          name: key
        });
      }
    }, 100),

    changeStatus(status) {
      this.updateStatus({
        activeIndex: this.activeIndex,
        subactiveIndex: this.subactiveIndex,
        status: status
      });
    },
    clearLogs() {
      this.socket.emit('logsClear', {
        cwd: this.pkgs[this.activeIndex].cwd,
        name: this.subactiveIndex
      });
    }
  }
};
</script>

<style lang="less" scoped>
.task-tabs-wrapper {
  min-width: 900px;

  /deep/ .el-tabs__content {
    min-height: 0 !important;
  }

  .sub-task-tabs-wrapper {
    padding: 0 30px;

    /deep/ .el-tabs__content {
      padding: 20px 0 10px !important;
      min-height: 0 !important;
    }

    .launch-btn {
      width: 140px;
      height: 34px;
      line-height: 34px;
      padding: 0;
      font-size: 18px;
      float: right;
    }

    .dark {
      color: #909399;
      font-size: 14px;
    }
  }
}
</style>
