<template>
  <TheHeader />
  <main class="main-content">
    <router-view />
  </main>
</template>

<script setup>
import TheHeader from './components/layout/TheHeader.vue'
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #f8fafc;
  color: #111827;
}

#app {
  min-height: 100vh;
}

.main-content {
  min-height: calc(100vh - 80px);
}
</style>