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
*,
*::before,
*::after {
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
  width: 100%;
}

.main-content {
  min-height: calc(100vh - 80px);
  width: 100%;
  padding: 20px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
}
</style>