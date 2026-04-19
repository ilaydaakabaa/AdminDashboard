<template>
  <span class="meta-chip" :class="variant">
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.meta-chip {
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
}

.meta-chip.product-backlog {
  background: #e0f2fe;
  color: #0369a1;
}

.meta-chip.sprint-backlog {
  background: #fef3c7;
  color: #92400e;
}

.meta-chip.test {
  background: #ede9fe;
  color: #6d28d9;
}

.meta-chip.done {
  background: #dcfce7;
  color: #166534;
}

.meta-chip.default {
  background: #eef2ff;
  color: #3730a3;
}
</style>