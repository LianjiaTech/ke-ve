<template>
  <el-alert
    v-show="disconneted"
    title="连接已断开"
    type="error"
    effect="dark"
    show-icon
    center
    :closable="false"
  ></el-alert>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'NetworkAlert',
  data() {
    return {
      disconneted: false
    };
  },
  mounted() {
    const socket = io(window.location.origin);
    socket.on('connect', () => {
      this.disconneted = false;
    });

    socket.on('disconnect', () => {
      this.disconneted = true;
    });
  }
};
</script>

