<!-- 详情页的过时提醒 -->
<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase, useRoute, useRouter } from "vitepress";
import { isApproximatelySixMonthsAgo } from "../utils";

const { frontmatter } = useData();
const props = defineProps<{
  url: string;
  title: string;
  cover: string;
  date: Object;
  categories: string[];
  hit: number;
  isArticleListHitsFetched: boolean;
}>();

const route = useRoute();
const router = useRouter();
// 标签没有隐藏就展示过期提醒，隐藏的一般是单独的页面
const show = computed(
  () =>
    !frontmatter.value?.hide &&
    isApproximatelySixMonthsAgo(frontmatter.value?.date)
);
</script>

<template>
  <div class="text-center mt-6">
    <div
      v-if="show"
      class="inline-block p-3"
      style="
        color: #f56c6c;
        letter-spacing: 0;
        background: #fef0f0;
        border-radius: 4px;
        border: solid 1px;
        font-size: 12px;
        text-align: center;
        opacity: 0.6;
        box-sizing: border-box;
        white-space: nowrap;
      "
    >
      文章发布较早，内容可能过时，阅读注意甄别。
    </div>
  </div>
</template>

<style></style>
