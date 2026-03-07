<script setup lang="ts">
import { computed } from "vue";
import { formatShowDate } from '../utils/index.js';

const props = defineProps<{
  content: string;
  date: string;
  tags?: string[];
}>();

const formattedDate = computed(() => formatShowDate(props.date));
</script>

<template>
  <div class="shuo-card">
    <div class="glass-card">
      <div class="p-3 sm:p-4 relative z-10">
        <!-- Content -->
        <p class="text-slate-700 leading-relaxed text-sm mb-3" style="white-space: pre-wrap;">
          {{ content }}
        </p>

        <!-- Footer -->
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span class="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formattedDate }}
          </span>

          <!-- Tags -->
          <span v-if="tags && tags.length > 0" class="flex gap-1">
            <span
              v-for="(tag, index) in tags"
              :key="index"
              class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
            >
              {{ tag }}
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shuo-card {
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
