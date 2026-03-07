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
      <div class="p-3 sm:p-4 md:p-5 relative z-10">
        <!-- Title -->
        <p v-if="title" class="mb-2 sm:mb-3 text-slate-800 font-semibold text-sm sm:text-base">
          {{ title }}
        </p>

        <!-- Content -->
        <p class="text-slate-700 leading-relaxed text-xs sm:text-sm" style="white-space: pre-wrap;">
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
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(31, 38, 135, 0.12);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 28px rgba(31, 38, 135, 0.18);
  transform: translateY(-2px);
}

@media (min-width: 640px) {
  .glass-card {
    border-radius: 14px;
    box-shadow: 0 6px 24px rgba(31, 38, 135, 0.14);
  }

  .glass-card:hover {
    box-shadow: 0 10px 32px rgba(31, 38, 135, 0.2);
  }
}

@media (min-width: 768px) {
  .glass-card {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  }

  .glass-card:hover {
    box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
  }
}
</style>
