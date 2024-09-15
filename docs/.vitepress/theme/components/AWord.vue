<!-- 心动一言 -->
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import { withBase } from "vitepress";

import AWord from '../constants/aWord.js';
import { reInitPv, sortByDateAscending } from '../utils/index.js'

const _AWord = sortByDateAscending(AWord);

onMounted(async () => {
  await nextTick();
  reInitPv();
});
</script>

<template>
  <div class="classes px-4 pt-14 pb-20 mx-auto -mt-4 md:px-0 max-w-7xl">
    <div class="text-2xl mb-4 text-slate-700">心动一言</div>
    <div class="w-fulltext-xl leading-normal rounded-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <div v-for="(item, index) in _AWord" :key="index" class="cursor-pointer">
        <div class="relative flex flex-col shadow-md mb-2 bg-white border border-slate-200 rounded-lg">
          <div class="p-4">
            <p class="mb-2 text-slate-600 text-base font-semibold">
              {{ item.title }}
            </p>
            <p class="text-slate-600 leading-normal text-sm font-light" style="white-space: pre-wrap;">
              {{ item.content }}
            </p>
            <p class="text-slate-400 leading-normal float-right text-xs font-light">
              {{ item.date }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
