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
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
