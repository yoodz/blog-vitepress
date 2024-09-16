<!-- 心动一言 -->
<script setup lang="ts">
import { onMounted, nextTick, ref } from "vue";

import AWord from '../constants/aWord.js';
import { reInitPv, sortByDateAscending } from '../utils/index.js'
import { IAWord } from '../interface/base';
import AWordCard from "./AWordCard.vue";

const left = ref<number>(0);
const right = ref<number>(0);
const leftList: IAWord[] = [];
const rightList: IAWord[] = [];
const PD = 158;
const LINE_HEIGH = 21

function caclList() {
  const afterSortList = sortByDateAscending(AWord);
  afterSortList.map(item => {
    const { content } = item || {};
    const line = Math.ceil(content.length / 43)
    const addLength = PD + LINE_HEIGH * line;
    if (left.value < right.value) {
      left.value += addLength;
      leftList.push(item);
    } else {
      right.value += addLength;
      rightList.push(item);
    }
  })
}

caclList()

onMounted(async () => {
  await nextTick();
  reInitPv();
});
</script>

<template>
  <div class="classes px-4 pt-14 pb-20 mx-auto -mt-4 md:px-0 max-w-7xl">
    <div class="text-2xl mb-4 text-slate-700">心动一言</div>
    <div class="w-fulltext-xl leading-normal rounded-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <!-- 左边列表 -->
      <div>
        <div v-for="(item, index) in leftList" :key="index" class="cursor-pointer hover:underline">
          <AWordCard :title="item.title" :content="item.content" :date="item.date" :desc="item.desc" />
        </div>
      </div>

      <!-- 右边列表 -->
      <div>
        <div v-for="(item, index) in rightList" :key="index" class="cursor-pointer hover:underline">
            <AWordCard :title="item.title" :content="item.content" :date="item.date" :desc="item.desc" />
        </div>
      </div>
    </div>
  </div>
</template>
