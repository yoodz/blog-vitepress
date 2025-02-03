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
  <div class="relative flex flex-col shadow-md mb-4 bg-white border border-slate-200 rounded-lg">
    <div class="p-4">
      <p class="mb-2 text-slate-600 text-base font-semibold">
        {{ title }}
      </p>
      <p class="text-slate-600 leading-normal text-sm font-light" style="white-space: pre-wrap;">
        {{ content }}
      </p>
      <p class="text-slate-400 leading-normal float-right text-xs font-light">
        发布于 {{ date }}
      </p>
    </div>
  </div>
</template>
