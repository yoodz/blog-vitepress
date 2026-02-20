<script setup lang="ts">
const props = defineProps<{
  title: string;
  content: string;
  date: string;
  desc: string;
}>();
const { title, content, date } = props || {};
</script>

<template>
  <div class="aword-card">
    <div class="glass-card">
      <div class="p-5 relative z-10">
        <!-- Title -->
        <p v-if="title" class="mb-3 text-slate-800 font-semibold text-base">
          {{ title }}
        </p>

        <!-- Content -->
        <p class="text-slate-700 leading-relaxed text-sm" style="white-space: pre-wrap;">
          {{ content }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aword-card {
  position: relative;
}

.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
  transform: translateY(-2px);
}
</style>
