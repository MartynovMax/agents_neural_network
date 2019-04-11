<template>
<div class="agents-app">

  <div id="agents-app__container"></div>

  <!-- <canvas id="stage"></canvas> -->
</div>
</template>

<script>
import App from './app.js'
import helpers from './helpers'

helpers()

export default {
  name: 'AgentsApp',
  mounted () {
    App()
  }
}
</script>


<style type="less">
html {
  background: #ccc;
}

canvas {
  position: absolute;
  top:0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
</style>
