<template>
<div id="app">
  <!-- <img src="./assets/logo.png"> -->
  <AgentsApp/>
</div>
</template>

<script>
import AgentsApp from './components/AgentsApp/AgentsApp.vue'

export default {
  name: 'App',
  components: {
    AgentsApp
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
