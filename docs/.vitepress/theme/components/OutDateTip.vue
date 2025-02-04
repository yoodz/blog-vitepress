<!-- 详情页的过时提醒 -->
<script setup lang="ts">
import { computed } from "vue";
import { useData, withBase, useRoute, useRouter } from "vitepress";
import { isWithinPastSixMonths } from "../utils";

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
const show = computed(() => !frontmatter.value?.hide && !isWithinPastSixMonths(frontmatter.value?.date));
</script>

<template>
  <div v-if="show" style="
  color:#f56c6c;
  letter-spacing:0;
  background: #fef0f0;
  border-radius: 4px;
  border: solid 1px;
  display: block;
  width: 50%;
  text-align: center;
  margin: 20px auto 0;
  padding: 10px 0;
  box-sizing: border-box;
">
  文章发布较早，内容可能过时，阅读注意甄别。
</div>
</template>

<style></style>
