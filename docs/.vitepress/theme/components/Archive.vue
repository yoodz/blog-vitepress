<!-- 归档页面 -->
<script setup lang="ts">
import { onMounted, nextTick } from "vue";
import { withBase } from "vitepress";

import { data } from "../posts.data.js";
import { reInitPv, classifyByYear } from '../utils/index.js'


const posts = classifyByYear(data);
const keys = Object.keys(posts).sort((a, b) => b - a);

onMounted(async () => {
  await nextTick();
  reInitPv();
});
</script>

<template>
  <div class="classes px-4 pt-14 pb-20 mx-auto -mt-4 md:px-0 max-w-2xl">
    <div class="w-full text-xl leading-normal text-gray-800 rounded-t md:text-2xl">
      <div v-for="key of keys" :key="key">
        <p class="pt-8 pb-2"> #{{ key }}</p>
        <div v-for="{ title, date, url } of posts[key]" :key="date.time"
          class="pt-1 flex justify-between text-base cursor-pointer text-gray-500 hover:text-gray-800">
          <a :href="withBase(url)" class="flex justify-between flex-1">
            {{ title }}
            <div>{{ date.formatShowDate }}</div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
